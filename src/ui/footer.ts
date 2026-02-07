import siteConfig from "../../site.toml";

export function renderFooter() {
    const footer = document.getElementById("footer");
    if (!footer) return;
    footer.innerHTML = `
        <div class="flex flex-wrap justify-center items-center gap-4 sm:gap-8">
            <span class="text-xs text-fg-muted">
                <a href="${siteConfig.project_url}" target="_blank">Star on GitHub</a>
            </span>
            <span class="text-xs text-fg-muted">
                <a href="${siteConfig.project_url}/issues" target="_blank">Report an Error</a>
            </span>
            <span id="build-date" class="w-full sm:w-auto text-xs text-fg-muted order-last text-center">
              Last updated on ${BUILD_DATE}
            </span>
        </div>
    `;
}