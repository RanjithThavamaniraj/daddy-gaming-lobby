import { useEffect } from "react";

import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_OG_IMAGE,
  absoluteUrl,
} from "../config/siteConfig";

const JSON_LD_ATTR = "data-dgl-jsonld";

/**
 * Updates document title, canonical, meta tags, and optional JSON-LD per route.
 * @param {object} props
 * @param {string} [props.title]
 * @param {string} [props.description]
 * @param {string} [props.path] - Canonical path (defaults to current pathname)
 * @param {string} [props.image] - Absolute OG/Twitter image URL
 * @param {boolean} [props.noindex]
 * @param {object|object[]|null} [props.jsonLd]
 */
export default function PageMeta({
  title,
  description = SITE_DESCRIPTION,
  path,
  image = SITE_OG_IMAGE,
  noindex = false,
  jsonLd = null,
}) {
  const jsonLdKey = jsonLd ? JSON.stringify(jsonLd) : "";

  useEffect(() => {
    const pathname = path ?? window.location.pathname;
    const canonicalHref = absoluteUrl(pathname);
    const pageTitle =
      title && title !== SITE_NAME ? `${title} | ${SITE_NAME}` : SITE_NAME;
    const parsedJsonLd = jsonLdKey ? JSON.parse(jsonLdKey) : null;

    document.title = pageTitle;

    const setMeta = (selector, attribute, name, content) => {
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", canonicalHref);

    setMeta('meta[name="description"]', "name", "description", description);
    setMeta(
      'meta[name="robots"]',
      "name",
      "robots",
      noindex ? "noindex, nofollow" : "index, follow"
    );

    setMeta('meta[property="og:title"]', "property", "og:title", pageTitle);
    setMeta(
      'meta[property="og:description"]',
      "property",
      "og:description",
      description
    );
    setMeta('meta[property="og:type"]', "property", "og:type", "website");
    setMeta('meta[property="og:site_name"]', "property", "og:site_name", SITE_NAME);
    setMeta('meta[property="og:url"]', "property", "og:url", canonicalHref);
    setMeta('meta[property="og:image"]', "property", "og:image", image);
    setMeta('meta[property="og:image:width"]', "property", "og:image:width", "1200");
    setMeta('meta[property="og:image:height"]', "property", "og:image:height", "630");
    setMeta(
      'meta[property="og:image:alt"]',
      "property",
      "og:image:alt",
      `${SITE_NAME} — Play Together. Win Together.`
    );

    setMeta('meta[name="twitter:card"]', "name", "twitter:card", "summary_large_image");
    setMeta('meta[name="twitter:title"]', "name", "twitter:title", pageTitle);
    setMeta(
      'meta[name="twitter:description"]',
      "name",
      "twitter:description",
      description
    );
    setMeta('meta[name="twitter:image"]', "name", "twitter:image", image);

    document
      .querySelectorAll(`script[${JSON_LD_ATTR}]`)
      .forEach((node) => node.remove());

    if (parsedJsonLd) {
      const blocks = Array.isArray(parsedJsonLd) ? parsedJsonLd : [parsedJsonLd];
      blocks.filter(Boolean).forEach((block) => {
        const script = document.createElement("script");
        script.type = "application/ld+json";
        script.setAttribute(JSON_LD_ATTR, "true");
        script.textContent = JSON.stringify(block);
        document.head.appendChild(script);
      });
    }

    return () => {
      document
        .querySelectorAll(`script[${JSON_LD_ATTR}]`)
        .forEach((node) => node.remove());
    };
  }, [title, description, path, image, noindex, jsonLdKey]);

  return null;
}
