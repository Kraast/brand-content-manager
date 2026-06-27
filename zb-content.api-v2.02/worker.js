import { APP_METADATA, getAppMetadataHeaders } from "./app-metadata.mjs";

const SHOPIFY_CONFIG = Object.freeze({
  storeDomain: "zerobubble-mt.myshopify.com",
  blogId: "gid://shopify/Blog/75337367743",
  blogHandle: "zerobubble-articles",
  defaultAuthorName: "Chris Ellul",
  defaultPageTemplate: "",
});

const META_CONFIG = Object.freeze({
  facebookPageId: "123456789012345",
  instagramBusinessAccountId: "17841400000000000",
});

const SHOPIFY_SUPPORTED_TYPES = Object.freeze([
  "Blog Post",
  "Service Page Section",
  "Homepage Section",
  "Landing Page Copy",
  "FAQ Block",
  "Case Study",
]);

const REFERENCE_LIBRARY_BRANDS = Object.freeze(["zerobubble", "smartone"]);
const REFERENCE_LIBRARY_TAGS = Object.freeze([
  "device",
  "logo",
  "environment",
  "style-guide",
  "campaign-reference",
  "do-not-deviate",
]);

// Only these origins may call the API from a browser. Add a custom domain here if one is set up later.
const ALLOWED_ORIGINS = [
  "https://brand-content-manager.pages.dev",
];

function isAllowedOrigin(origin) {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  // Allow Cloudflare Pages preview deployments: <hash>.brand-content-manager.pages.dev
  try {
    return new URL(origin).host.endsWith(".brand-content-manager.pages.dev");
  } catch {
    return false;
  }
}

function corsHeaders(origin) {
  const allow = isAllowedOrigin(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Admin-Token",
    "Vary": "Origin",
  };
}

function jsonResponse(data, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
}

function errorResponse(message, status, headers, extra = {}) {
  return jsonResponse({ error: message, ...extra }, { status, headers });
}

function referenceLibraryAvailable(env) {
  return Boolean(env.REFERENCE_LIBRARY);
}

function requireReferenceLibrary(env, headers) {
  if (!referenceLibraryAvailable(env)) {
    return errorResponse("Reference image library is not configured on the Worker yet.", 503, headers, {
      configStatus: "reference_library_missing",
    });
  }
  return null;
}

function publishingBackendTokenConfigured(env) {
  return Boolean(env.PUBLISH_ADMIN_TOKEN);
}

function requireAdmin(request, env, headers) {
  const adminToken = request.headers.get("X-Admin-Token");
  if (!publishingBackendTokenConfigured(env)) {
    return errorResponse("Publishing backend token is not configured.", 503, headers, {
      authStatus: "backend_token_missing",
    });
  }
  if (!adminToken) {
    return errorResponse("Missing admin token.", 401, headers, {
      authStatus: "missing_token",
    });
  }
  if (adminToken !== env.PUBLISH_ADMIN_TOKEN) {
    return errorResponse("Unauthorized", 401, headers, {
      authStatus: "invalid_token",
    });
  }
  return null;
}

// Verifies a Cloudflare Turnstile token before a credit-spending OpenAI call.
// Each token is single-use; the frontend sends a fresh one per request.
async function verifyTurnstile(body, request, env) {
  if (!env.TURNSTILE_SECRET_KEY) {
    return { ok: false, status: 503, error: "Turnstile is not configured on the Worker." };
  }
  const token = body && body.turnstileToken;
  if (!token) {
    return { ok: false, status: 403, error: "Missing Turnstile verification token." };
  }
  const form = new URLSearchParams();
  form.set("secret", env.TURNSTILE_SECRET_KEY);
  form.set("response", token);
  const ip = request.headers.get("CF-Connecting-IP");
  if (ip) form.set("remoteip", ip);
  let data;
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: form,
    });
    data = await res.json();
  } catch (err) {
    return { ok: false, status: 502, error: "Turnstile verification request failed." };
  }
  if (!data.success) {
    return { ok: false, status: 403, error: "Turnstile verification failed.", codes: data["error-codes"] };
  }
  return { ok: true, status: 200 };
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 255);
}

function normalizeBrandId(brand) {
  const normalized = String(brand || "").trim().toLowerCase();
  return REFERENCE_LIBRARY_BRANDS.includes(normalized) ? normalized : "";
}

function normalizeReferenceTags(tags) {
  const rawTags = Array.isArray(tags) ? tags : [];
  return [...new Set(
    rawTags
      .map((tag) => String(tag || "").trim().toLowerCase())
      .filter((tag) => REFERENCE_LIBRARY_TAGS.includes(tag))
  )];
}

function fileExtensionFromContentType(contentType) {
  switch (String(contentType || "").toLowerCase()) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    default:
      return "";
  }
}

function fileExtensionFromName(filename) {
  const match = String(filename || "").toLowerCase().match(/\.([a-z0-9]+)$/);
  return match ? match[1] : "";
}

function resolveReferenceImageExtension(filename, contentType) {
  return fileExtensionFromContentType(contentType) || fileExtensionFromName(filename) || "png";
}

function decodeBase64ToBytes(dataUrlOrBase64) {
  const raw = String(dataUrlOrBase64 || "");
  const base64 = raw.includes(",") ? raw.split(",")[1] : raw;
  return Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
}

function buildReferenceImageBlob(reference) {
  const contentType = String(reference?.contentType || "image/png").trim().toLowerCase() || "image/png";
  const bytes = decodeBase64ToBytes(reference?.base64 || "");
  return new Blob([bytes], { type: contentType });
}

function buildReferenceObjectUrl(requestUrl, key) {
  const url = new URL(requestUrl);
  const encodedKey = key
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return `${url.origin}/references/object/${encodedKey}`;
}

function mapReferenceLibraryItem(item, requestUrl) {
  const metadata = item.customMetadata || {};
  const tags = String(metadata.tags || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
  return {
    id: metadata.id || item.key,
    key: item.key,
    brand: metadata.brand || item.key.split("/")[0] || "",
    name: metadata.name || item.key.split("/").pop() || "reference-image",
    tags,
    createdAt: metadata.createdAt || item.uploaded?.toISOString?.() || null,
    size: item.size || 0,
    contentType: item.httpMetadata?.contentType || metadata.contentType || "image/png",
    url: buildReferenceObjectUrl(requestUrl, item.key),
  };
}

async function listReferenceLibrary(brand, env, requestUrl) {
  const prefix = `${brand}/`;
  const objects = [];
  let cursor;

  do {
    const result = await env.REFERENCE_LIBRARY.list({
      prefix,
      limit: 1000,
      cursor,
    });
    objects.push(...(result.objects || []));
    cursor = result.truncated ? result.cursor : undefined;
  } while (cursor);

  const hydratedObjects = await Promise.all(objects.map(async (item) => {
    const stored = await env.REFERENCE_LIBRARY.head(item.key);
    return { key: item.key, ...(stored || item) };
  }));

  return hydratedObjects
    .map((item) => mapReferenceLibraryItem(item, requestUrl))
    .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
}

async function createReferenceLibraryItem(body, env, requestUrl) {
  const brand = normalizeBrandId(body.brand);
  if (!brand) {
    throw new Error("A valid brand is required.");
  }

  const tags = normalizeReferenceTags(body.tags);
  const contentType = String(body.contentType || "").trim().toLowerCase();
  if (!contentType.startsWith("image/")) {
    throw new Error("Only image uploads are supported.");
  }

  const filename = String(body.filename || "reference-image").trim() || "reference-image";
  const extension = resolveReferenceImageExtension(filename, contentType);
  const id = crypto.randomUUID();
  const key = `${brand}/${id}.${extension}`;
  const bytes = decodeBase64ToBytes(body.base64);

  await env.REFERENCE_LIBRARY.put(key, bytes, {
    httpMetadata: {
      contentType,
    },
    customMetadata: {
      id,
      brand,
      name: filename,
      tags: tags.join(","),
      createdAt: new Date().toISOString(),
      contentType,
    },
  });

  const stored = await env.REFERENCE_LIBRARY.head(key);
  return mapReferenceLibraryItem({ key, ...(stored || {}) }, requestUrl);
}

async function updateReferenceLibraryItemTags(key, tags, env, requestUrl) {
  const trimmedKey = String(key || "").trim();
  if (!trimmedKey) {
    throw new Error("Reference key is required.");
  }

  const object = await env.REFERENCE_LIBRARY.get(trimmedKey);
  if (!object) {
    throw new Error("Reference image not found.");
  }

  const normalizedTags = normalizeReferenceTags(tags);
  const metadata = object.customMetadata || {};
  const brand = normalizeBrandId(metadata.brand || trimmedKey.split("/")[0] || "");
  if (!brand) {
    throw new Error("Invalid reference key.");
  }

  const contentType = object.httpMetadata?.contentType || metadata.contentType || "image/png";
  const bytes = await object.arrayBuffer();

  await env.REFERENCE_LIBRARY.put(trimmedKey, bytes, {
    httpMetadata: {
      contentType,
    },
    customMetadata: {
      id: metadata.id || trimmedKey,
      brand,
      name: metadata.name || trimmedKey.split("/").pop() || "reference-image",
      tags: normalizedTags.join(","),
      createdAt: metadata.createdAt || new Date().toISOString(),
      contentType,
    },
  });

  const stored = await env.REFERENCE_LIBRARY.head(trimmedKey);
  return mapReferenceLibraryItem({ key: trimmedKey, ...(stored || {}) }, requestUrl);
}

async function deleteReferenceLibraryItem(key, env) {
  const trimmedKey = String(key || "").trim();
  if (!trimmedKey) {
    throw new Error("Reference key is required.");
  }

  const [brand] = trimmedKey.split("/");
  if (!REFERENCE_LIBRARY_BRANDS.includes(brand)) {
    throw new Error("Invalid reference key.");
  }

  await env.REFERENCE_LIBRARY.delete(trimmedKey);
  return { key: trimmedKey };
}

async function fetchReferenceObject(key, env, baseHeaders = {}) {
  const object = await env.REFERENCE_LIBRARY.get(key);
  if (!object) return null;

  const headers = new Headers();
  Object.entries(baseHeaders).forEach(([name, value]) => {
    headers.set(name, value);
  });
  object.writeHttpMetadata(headers);
  headers.set("Cache-Control", "public, max-age=3600");
  if (object.httpEtag) {
    headers.set("ETag", object.httpEtag);
  }

  return new Response(object.body, { headers });
}

async function hostImageForPublishing(base64, env, requestUrl) {
  if (!env.REFERENCE_LIBRARY) {
    throw new Error("Image hosting requires the REFERENCE_LIBRARY R2 binding.");
  }
  const bytes = decodeBase64ToBytes(base64);
  const key = `published/${crypto.randomUUID()}.png`;
  await env.REFERENCE_LIBRARY.put(key, bytes, {
    httpMetadata: { contentType: "image/png" },
    customMetadata: { createdAt: new Date().toISOString(), purpose: "publish" },
  });
  return buildReferenceObjectUrl(requestUrl, key);
}

function paragraphHtml(text) {
  const trimmed = String(text || "").trim();
  if (!trimmed) return "";

  return trimmed
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

function listHtml(items) {
  if (!Array.isArray(items) || !items.length) return "";
  return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function ctaHtml(cta) {
  const trimmed = String(cta || "").trim();
  if (!trimmed) return "";
  return `<p><strong>Next step:</strong> ${escapeHtml(trimmed)}</p>`;
}

function getShopifyStatus(env) {
  const issues = [];

  if (!env.SHOPIFY_CLIENT_ID) {
    issues.push("Add the SHOPIFY_CLIENT_ID Worker secret.");
  }
  if (!env.SHOPIFY_CLIENT_SECRET) {
    issues.push("Add the SHOPIFY_CLIENT_SECRET Worker secret.");
  }
  if (!SHOPIFY_CONFIG.storeDomain || SHOPIFY_CONFIG.storeDomain.includes("your-store")) {
    issues.push("Replace the placeholder Shopify store domain in worker.js.");
  }
  if (!SHOPIFY_CONFIG.blogId || SHOPIFY_CONFIG.blogId.includes("1234567890")) {
    issues.push("Replace the placeholder Shopify blog ID in worker.js.");
  }

  return {
    ready: issues.length === 0,
    issues,
    storeDomain: SHOPIFY_CONFIG.storeDomain,
    blogId: SHOPIFY_CONFIG.blogId,
    defaultAuthorName: SHOPIFY_CONFIG.defaultAuthorName,
    supportedContentTypes: SHOPIFY_SUPPORTED_TYPES,
  };
}

function getMetaStatus(env) {
  const facebookIssues = [];
  const instagramIssues = [];

  if (!env.META_PAGE_ACCESS_TOKEN) {
    facebookIssues.push("Add the META_PAGE_ACCESS_TOKEN Worker secret.");
    instagramIssues.push("Add the META_PAGE_ACCESS_TOKEN Worker secret.");
  }
  if (!META_CONFIG.facebookPageId || META_CONFIG.facebookPageId.includes("1234567890")) {
    facebookIssues.push("Replace the placeholder Facebook Page ID in worker.js.");
  }
  if (!META_CONFIG.instagramBusinessAccountId || META_CONFIG.instagramBusinessAccountId.includes("1784140")) {
    instagramIssues.push("Replace the placeholder Instagram Business Account ID in worker.js.");
  }
  if (!env.REFERENCE_LIBRARY) {
    instagramIssues.push("Instagram image hosting requires the REFERENCE_LIBRARY R2 binding.");
  }

  const facebookReady = facebookIssues.length === 0;
  const instagramReady = instagramIssues.length === 0;

  return {
    ready: facebookReady || instagramReady,
    facebookReady,
    instagramReady,
    instagramDirectReady: instagramReady,
    facebookIssues,
    instagramIssues,
    facebookPageId: META_CONFIG.facebookPageId,
    instagramBusinessAccountId: META_CONFIG.instagramBusinessAccountId,
    instagramRequiresPublicImageUrl: false,
  };
}

function buildShopifyArticle(payload) {
  const title = payload.title || "Untitled Article";
  const slug = slugify(payload.slug || title);
  const sections = Array.isArray(payload.sections) ? payload.sections : [];
  const outline = Array.isArray(payload.outline) ? payload.outline : [];
  const html = [
    paragraphHtml(payload.intro),
    outline.length ? "<h2>Outline</h2>" : "",
    listHtml(outline),
    ...sections.map((section) => {
      const heading = section?.heading ? `<h2>${escapeHtml(section.heading)}</h2>` : "";
      const body = paragraphHtml(section?.body);
      return `${heading}${body}`;
    }),
    ctaHtml(payload.cta),
  ].join("");

  return {
    title,
    handle: slug,
    summary: payload.meta_description || payload.intro || "",
    body: html,
    isPublished: true,
    blogId: SHOPIFY_CONFIG.blogId,
    author: {
      name: SHOPIFY_CONFIG.defaultAuthorName,
    },
  };
}

function buildShopifyPage(payload, fallbackTitle) {
  const title = payload.headline || payload.title || fallbackTitle;
  const slug = slugify(payload.slug || title);
  const html = [
    payload.subheadline ? `<p><strong>${escapeHtml(payload.subheadline)}</strong></p>` : "",
    paragraphHtml(payload.body || payload.problem || payload.challenge || payload.intro),
    payload.solution ? `<h2>Solution</h2>${paragraphHtml(payload.solution)}` : "",
    payload.value_points?.length ? "<h2>Value Points</h2>" : "",
    listHtml(payload.value_points),
    payload.bullets?.length ? "<h2>Key Benefits</h2>" : "",
    listHtml(payload.bullets),
    payload.proof_points?.length ? "<h2>Proof Points</h2>" : "",
    listHtml(payload.proof_points),
    payload.outcomes?.length ? "<h2>Outcomes</h2>" : "",
    listHtml(payload.outcomes),
    Array.isArray(payload.faqs) && payload.faqs.length
      ? payload.faqs
          .map((faq) => `<h2>${escapeHtml(faq.question)}</h2>${paragraphHtml(faq.answer)}`)
          .join("")
      : "",
    ctaHtml(payload.cta),
  ].join("");

  return {
    title,
    handle: slug,
    body: html,
    isPublished: true,
    templateSuffix: SHOPIFY_CONFIG.defaultPageTemplate || undefined,
  };
}

async function getShopifyAccessToken(env) {
  const tokenBody = new URLSearchParams();
  tokenBody.set("grant_type", "client_credentials");
  tokenBody.set("client_id", env.SHOPIFY_CLIENT_ID);
  tokenBody.set("client_secret", env.SHOPIFY_CLIENT_SECRET);

  const response = await fetch(`https://${SHOPIFY_CONFIG.storeDomain}/admin/oauth/access_token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: tokenBody,
  });

  const data = await response.json();
  if (!response.ok || !data.access_token) {
    throw new Error(data.error_description || data.error || "Unable to get a Shopify access token");
  }

  return data.access_token;
}

async function callShopify(query, variables, env) {
  const accessToken = await getShopifyAccessToken(env);
  const response = await fetch(`https://${SHOPIFY_CONFIG.storeDomain}/admin/api/2026-04/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": accessToken,
    },
    body: JSON.stringify({ query, variables }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.errors?.[0]?.message || "Shopify request failed");
  }

  if (data.errors?.length) {
    throw new Error(data.errors[0].message || "Shopify request failed");
  }

  return data;
}

async function getShopifyBlogs(env) {
  const status = getShopifyStatus(env);
  const credentialIssues = status.issues.filter((issue) => !issue.includes("blog ID"));
  if (credentialIssues.length) {
    throw new Error(credentialIssues[0]);
  }

  const query = `query GetBlogs {
    blogs(first: 50) {
      nodes {
        id
        title
        handle
      }
    }
  }`;
  const data = await callShopify(query, {}, env);
  return data.data?.blogs?.nodes || [];
}

async function publishToShopify(payload, env) {
  const status = getShopifyStatus(env);
  if (!status.ready) {
    throw new Error(status.issues[0]);
  }
  if (!SHOPIFY_SUPPORTED_TYPES.includes(payload.contentType)) {
    throw new Error(`Unsupported Shopify content type: ${payload.contentType}`);
  }

  if (payload.contentType === "Blog Post") {
    const article = buildShopifyArticle(payload.payload || {});
    const query = `mutation CreateArticle($article: ArticleCreateInput!) {
      articleCreate(article: $article) {
        article {
          id
          title
          handle
        }
        userErrors {
          field
          message
        }
      }
    }`;
    const data = await callShopify(query, { article }, env);
    const userErrors = data.data?.articleCreate?.userErrors || [];
    if (userErrors.length) {
      throw new Error(userErrors.map((entry) => entry.message).join("; "));
    }
    const articleRecord = data.data?.articleCreate?.article;
    return {
      platform: "shopify",
      type: "article",
      id: articleRecord?.id || null,
      title: articleRecord?.title || article.title,
      handle: articleRecord?.handle || article.handle,
      url: `https://${SHOPIFY_CONFIG.storeDomain}/blogs/${SHOPIFY_CONFIG.blogHandle}/${articleRecord?.handle || article.handle}`,
    };
  }

  const page = buildShopifyPage(payload.payload || {}, payload.contentType || "Published Page");
  const query = `mutation CreatePage($page: PageCreateInput!) {
    pageCreate(page: $page) {
      page {
        id
        title
        handle
      }
      userErrors {
        field
        message
      }
    }
  }`;
  const data = await callShopify(query, { page }, env);
  const userErrors = data.data?.pageCreate?.userErrors || [];
  if (userErrors.length) {
    throw new Error(userErrors.map((entry) => entry.message).join("; "));
  }
  const pageRecord = data.data?.pageCreate?.page;
  return {
    platform: "shopify",
    type: "page",
    id: pageRecord?.id || null,
    title: pageRecord?.title || page.title,
    handle: pageRecord?.handle || page.handle,
    url: `https://${SHOPIFY_CONFIG.storeDomain}/pages/${pageRecord?.handle || page.handle}`,
  };
}

function decodeBase64Image(dataUrlOrBase64) {
  const bytes = decodeBase64ToBytes(dataUrlOrBase64);
  return new Blob([bytes], { type: "image/png" });
}

async function publishToFacebook(payload, env) {
  const status = getMetaStatus(env);
  if (!status.facebookReady) {
    throw new Error(status.facebookIssues[0]);
  }

  const caption = String(payload.caption || "").trim();
  const imageBase64 = payload.imageBase64;

  if (imageBase64) {
    const formData = new FormData();
    formData.set("caption", caption);
    formData.set("access_token", env.META_PAGE_ACCESS_TOKEN);
    formData.set("source", decodeBase64Image(imageBase64), "generated-image.png");

    const photoResponse = await fetch(`https://graph.facebook.com/v23.0/${META_CONFIG.facebookPageId}/photos`, {
      method: "POST",
      body: formData,
    });
    const photoData = await photoResponse.json();
    if (!photoResponse.ok || photoData.error) {
      throw new Error(photoData.error?.message || "Facebook publish failed");
    }
    return {
      platform: "facebook",
      postId: photoData.post_id || photoData.id || null,
      id: photoData.id || null,
    };
  }

  const feedBody = new URLSearchParams();
  feedBody.set("message", caption);
  feedBody.set("access_token", env.META_PAGE_ACCESS_TOKEN);

  const feedResponse = await fetch(`https://graph.facebook.com/v23.0/${META_CONFIG.facebookPageId}/feed`, {
    method: "POST",
    body: feedBody,
  });
  const feedData = await feedResponse.json();
  if (!feedResponse.ok || feedData.error) {
    throw new Error(feedData.error?.message || "Facebook publish failed");
  }

  return {
    platform: "facebook",
    postId: feedData.id || null,
  };
}

async function publishToInstagram(payload, env) {
  const status = getMetaStatus(env);
  if (!status.instagramReady) {
    throw new Error(status.instagramIssues[0]);
  }

  if (!payload.imageUrl) {
    throw new Error("Instagram publishing needs a public image URL. Add image hosting before enabling this route.");
  }

  const createBody = new URLSearchParams();
  createBody.set("image_url", payload.imageUrl);
  createBody.set("caption", String(payload.caption || ""));
  createBody.set("access_token", env.META_PAGE_ACCESS_TOKEN);

  const createResponse = await fetch(`https://graph.facebook.com/v23.0/${META_CONFIG.instagramBusinessAccountId}/media`, {
    method: "POST",
    body: createBody,
  });
  const createData = await createResponse.json();
  if (!createResponse.ok || createData.error) {
    throw new Error(createData.error?.message || "Instagram media creation failed");
  }

  const publishBody = new URLSearchParams();
  publishBody.set("creation_id", createData.id);
  publishBody.set("access_token", env.META_PAGE_ACCESS_TOKEN);

  const publishResponse = await fetch(`https://graph.facebook.com/v23.0/${META_CONFIG.instagramBusinessAccountId}/media_publish`, {
    method: "POST",
    body: publishBody,
  });
  const publishData = await publishResponse.json();
  if (!publishResponse.ok || publishData.error) {
    throw new Error(publishData.error?.message || "Instagram publish failed");
  }

  return {
    platform: "instagram",
    creationId: createData.id,
    publishId: publishData.id || null,
  };
}

async function handleImage(body, env, headers) {
  const {
    prompt,
    size = "1024x1024",
    quality = "high",
    model = "gpt-image-2",
    references = [],
  } = body;

  if (!prompt) {
    return errorResponse("prompt is required", 400, headers);
  }

  const qualityMap = {
    standard: "medium",
    hd: "high",
    low: "low",
    medium: "medium",
    high: "high",
    auto: "auto",
  };
  const normalizedQuality = qualityMap[quality] || "high";
  const validReferences = Array.isArray(references)
    ? references.filter((reference) => reference?.base64)
    : [];

  if (validReferences.length) {
    const formData = new FormData();
    formData.set("model", model);
    formData.set("prompt", prompt);
    formData.set("size", size);
    formData.set("quality", normalizedQuality);
    formData.set("moderation", "auto");
    formData.set("output_format", "png");

    validReferences.forEach((reference, index) => {
      const fallbackExt = fileExtensionFromContentType(reference.contentType) || "png";
      const filename = String(reference.name || `reference-${index + 1}.${fallbackExt}`).trim() || `reference-${index + 1}.${fallbackExt}`;
      formData.append("image[]", buildReferenceImageBlob(reference), filename);
    });

    const imageRes = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      },
      body: formData,
    });

    const imageData = await imageRes.json();
    if (!imageRes.ok) {
      return errorResponse(imageData.error?.message || "Reference-guided image generation failed", imageRes.status, headers);
    }

    return jsonResponse(
      {
        ...imageData,
        requested_model: model,
        requested_quality: normalizedQuality,
        reference_count: validReferences.length,
        generation_mode: "edit",
      },
      { headers }
    );
  }

  const imageRes = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      prompt,
      n: 1,
      size,
      quality: normalizedQuality,
      moderation: "auto",
      output_format: "png",
    }),
  });

  const imageData = await imageRes.json();
  if (!imageRes.ok) {
    return errorResponse(imageData.error?.message || "Image generation failed", imageRes.status, headers);
  }

  return jsonResponse(
    {
      ...imageData,
      requested_model: model,
      requested_quality: normalizedQuality,
      reference_count: 0,
      generation_mode: "generate",
    },
    { headers }
  );
}

function normalizeResponsesContent(content) {
  if (Array.isArray(content)) {
    return content
      .map((item) => {
        if (!item || typeof item !== "object") return null;

        if (item.type === "text") {
          return {
            type: "input_text",
            text: String(item.text || ""),
          };
        }

        if (item.type === "image_url") {
          const imageUrl = typeof item.image_url === "string" ? item.image_url : item.image_url?.url;
          if (!imageUrl) return null;

          return {
            type: "input_image",
            image_url: imageUrl,
            ...(item.image_url?.detail ? { detail: item.image_url.detail } : {}),
          };
        }

        return null;
      })
      .filter(Boolean);
  }

  if (typeof content === "string") {
    return content;
  }

  return String(content ?? "");
}

function buildResponsesInput(messages, system) {
  const input = [];

  if (system) {
    input.push({
      role: "system",
      content: String(system),
    });
  }

  if (Array.isArray(messages)) {
    for (const message of messages) {
      input.push({
        role: message?.role || "user",
        content: normalizeResponsesContent(message?.content),
      });
    }
  }

  return input;
}

function normalizeResponsesTextConfig(responseFormat) {
  if (!responseFormat || typeof responseFormat !== "object") {
    return null;
  }

  if (responseFormat.type === "json_object") {
    return {
      format: {
        type: "json_object",
      },
    };
  }

  if (responseFormat.type === "json_schema" && responseFormat.json_schema?.schema) {
    return {
      format: {
        type: "json_schema",
        name: responseFormat.json_schema.name || "structured_output",
        strict: responseFormat.json_schema.strict ?? true,
        schema: responseFormat.json_schema.schema,
      },
    };
  }

  return null;
}

function extractResponsesText(responseData) {
  if (typeof responseData.output_text === "string" && responseData.output_text.trim()) {
    return responseData.output_text;
  }

  const message = Array.isArray(responseData.output)
    ? responseData.output.find((item) => item.type === "message")
    : null;
  const content = Array.isArray(message?.content) ? message.content : [];
  const textItem = content.find((item) => item.type === "output_text");
  if (typeof textItem?.text === "string" && textItem.text.trim()) {
    return textItem.text;
  }

  const refusalItem = content.find((item) => item.type === "refusal");
  if (typeof refusalItem?.refusal === "string" && refusalItem.refusal.trim()) {
    return refusalItem.refusal;
  }

  return "";
}

async function handleGenerate(body, env, headers) {
  const {
    model = "gpt-5.5",
    max_tokens = 1500,
    messages,
    system,
    response_format,
    reasoning,
  } = body;
  const textConfig = normalizeResponsesTextConfig(response_format);

  const textRes = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      input: buildResponsesInput(messages, system),
      max_output_tokens: max_tokens,
      // Lower reasoning effort frees more of the token budget for visible output
      // (prevents long-form blog JSON from truncating). Passed through from the client.
      ...(reasoning ? { reasoning } : {}),
      ...(textConfig ? { text: textConfig } : {}),
    }),
  });

  const textData = await textRes.json();
  if (!textRes.ok) {
    return errorResponse(textData.error?.message || "Text generation failed", textRes.status, headers);
  }

  const responseText = extractResponsesText(textData);
  if (!responseText) {
    return errorResponse("Text generation returned no usable text output", 502, headers, {
      responseStatus: textData.status || "unknown",
    });
  }

  return jsonResponse(
    {
      content: [
        {
          type: "text",
          text: responseText,
        },
      ],
      model: textData.model || model,
      usage: textData.usage,
      response_id: textData.id || null,
      response_status: textData.status || null,
    },
    { headers }
  );
}

function publishingStatus(env) {
  return {
    shopify: getShopifyStatus(env),
    meta: getMetaStatus(env),
  };
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin");
    const headers = { ...corsHeaders(origin), ...getAppMetadataHeaders() };

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers });
    }

    // Reject browser calls from origins that are not on the allowlist. Requests with no
    // Origin header (server-side fetches, <img> loads, Meta/Instagram fetching public
    // reference image URLs) are allowed through.
    if (origin && !isAllowedOrigin(origin)) {
      return new Response("Forbidden", { status: 403, headers });
    }

    const url = new URL(request.url);

    try {
      if (request.method === "GET" && url.pathname === "/metadata") {
        return jsonResponse(APP_METADATA, { headers });
      }

      if (request.method === "GET" && url.pathname === "/publishing/status") {
        const authError = requireAdmin(request, env, headers);
        if (authError) return authError;
        return jsonResponse(publishingStatus(env), { headers });
      }

      if (request.method === "GET" && url.pathname === "/references") {
        const libraryError = requireReferenceLibrary(env, headers);
        if (libraryError) return libraryError;
        const brand = normalizeBrandId(url.searchParams.get("brand"));
        if (!brand) {
          return errorResponse("A valid brand query parameter is required.", 400, headers);
        }
        const items = await listReferenceLibrary(brand, env, request.url);
        return jsonResponse({
          ok: true,
          brand,
          availableTags: REFERENCE_LIBRARY_TAGS,
          items,
        }, { headers });
      }

      if (request.method === "GET" && url.pathname.startsWith("/references/object/")) {
        const libraryError = requireReferenceLibrary(env, headers);
        if (libraryError) return libraryError;
        const key = decodeURIComponent(url.pathname.replace("/references/object/", ""));
        const objectResponse = await fetchReferenceObject(key, env, headers);
        return objectResponse || errorResponse("Reference image not found", 404, headers);
      }

      if (request.method === "POST" && url.pathname === "/references/upload") {
        const libraryError = requireReferenceLibrary(env, headers);
        if (libraryError) return libraryError;
        const authError = requireAdmin(request, env, headers);
        if (authError) return authError;
        const body = await request.json();
        const item = await createReferenceLibraryItem(body, env, request.url);
        return jsonResponse({ ok: true, item }, { headers });
      }

      if (request.method === "POST" && url.pathname === "/references/delete") {
        const libraryError = requireReferenceLibrary(env, headers);
        if (libraryError) return libraryError;
        const authError = requireAdmin(request, env, headers);
        if (authError) return authError;
        const body = await request.json();
        const result = await deleteReferenceLibraryItem(body.key, env);
        return jsonResponse({ ok: true, result }, { headers });
      }

      if (request.method === "POST" && url.pathname === "/references/update-tags") {
        const libraryError = requireReferenceLibrary(env, headers);
        if (libraryError) return libraryError;
        const authError = requireAdmin(request, env, headers);
        if (authError) return authError;
        const body = await request.json();
        const item = await updateReferenceLibraryItemTags(body.key, body.tags, env, request.url);
        return jsonResponse({ ok: true, item }, { headers });
      }

      if (request.method === "POST" && url.pathname === "/image") {
        const body = await request.json();
        const ts = await verifyTurnstile(body, request, env);
        if (!ts.ok) return errorResponse(ts.error, ts.status, headers, { turnstile: ts.codes });
        return await handleImage(body, env, headers);
      }

      if (request.method === "POST" && (url.pathname === "/" || url.pathname === "/generate")) {
        const body = await request.json();
        const ts = await verifyTurnstile(body, request, env);
        if (!ts.ok) return errorResponse(ts.error, ts.status, headers, { turnstile: ts.codes });
        return await handleGenerate(body, env, headers);
      }

      if (request.method === "POST" && url.pathname === "/publishing/shopify/publish") {
        const authError = requireAdmin(request, env, headers);
        if (authError) return authError;
        const body = await request.json();
        const result = await publishToShopify(body, env);
        return jsonResponse({ ok: true, result }, { headers });
      }

      if (request.method === "GET" && url.pathname === "/publishing/shopify/blogs") {
        const authError = requireAdmin(request, env, headers);
        if (authError) return authError;
        const blogs = await getShopifyBlogs(env);
        return jsonResponse({ ok: true, blogs }, { headers });
      }

      if (request.method === "POST" && url.pathname === "/publishing/meta/publish") {
        const authError = requireAdmin(request, env, headers);
        if (authError) return authError;
        const body = await request.json();

        let result;
        if (body.target === "facebook") {
          result = await publishToFacebook(body, env);
        } else if (body.target === "instagram") {
          if (!body.imageUrl && body.imageBase64) {
            body.imageUrl = await hostImageForPublishing(body.imageBase64, env, request.url);
          }
          result = await publishToInstagram(body, env);
        } else {
          return errorResponse("Unsupported Meta target", 400, headers);
        }

        return jsonResponse({ ok: true, result }, { headers });
      }

      return errorResponse("Not found", 404, headers);
    } catch (error) {
      return errorResponse(error.message || "Unexpected error", 500, headers);
    }
  },
};
