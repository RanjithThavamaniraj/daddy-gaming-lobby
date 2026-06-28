import { useEffect } from "react";

import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "../config/siteConfig";

/**
 * Updates document title and meta tags per route.
 * @param {object} props
 * @param {string} [props.title]
 * @param {string} [props.description]
 */
export default function PageMeta({ title, description = SITE_DESCRIPTION }) {
  useEffect(() => {
    const pageTitle = title && title !== SITE_NAME ? `${title} — ${SITE_NAME}` : SITE_NAME;
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

    setMeta('meta[name="description"]', "name", "description", description);
    setMeta('meta[property="og:title"]', "property", "og:title", pageTitle);
    setMeta('meta[property="og:description"]', "property", "og:description", description);
    setMeta('meta[name="twitter:title"]', "name", "twitter:title", pageTitle);
    setMeta('meta[name="twitter:description"]', "name", "twitter:description", description);
    setMeta('meta[property="og:url"]', "property", "og:url", `${SITE_URL}${window.location.pathname}`);
    setMeta('meta[property="og:image"]', "property", "og:image", `${SITE_URL}/logo.png`);
    setMeta('meta[name="twitter:image"]', "name", "twitter:image", `${SITE_URL}/logo.png`);
  }, [title, description]);

  return null;
}
