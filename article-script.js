document.addEventListener("DOMContentLoaded", function () {
    createProgressBar();
    groupConsecutiveImages();
    createArticleNavigation();
});

function createProgressBar() {
    const progressBar = document.createElement("div");
    progressBar.id = "progress-bar";
    progressBar.style.position = "fixed";
    progressBar.style.top = "0";
    progressBar.style.left = "0";
    progressBar.style.height = "3px";
    progressBar.style.backgroundColor = "#70b1f1ff";
    progressBar.style.width = "0%";
    progressBar.style.zIndex = "9999";
    progressBar.style.transition = "width 0.1s";
    document.body.appendChild(progressBar);

    window.addEventListener("scroll", function () {
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        if (scrollHeight > 0) {
            progressBar.style.width = (scrollTop / scrollHeight) * 100 + "%";
        }
    });
}

function groupConsecutiveImages() {
    const children = Array.from(document.body.children);
    let imageRun = [];

    function flushImageRun() {
        if (imageRun.length < 2) {
            imageRun = [];
            return;
        }

        const gallery = document.createElement("div");
        gallery.className = "article-gallery";
        gallery.setAttribute("role", "group");
        gallery.setAttribute("aria-label", "文章图片");
        imageRun[0].before(gallery);
        imageRun.forEach(function (image) {
            gallery.appendChild(image);
        });
        imageRun = [];
    }

    children.forEach(function (element) {
        if (element.tagName === "IMG") {
            imageRun.push(element);
        } else {
            flushImageRun();
        }
    });
    flushImageRun();
}

function createArticleNavigation() {
    const topNavigation = document.createElement("nav");
    topNavigation.className = "article-top-navigation";
    topNavigation.setAttribute("aria-label", "文章导航");

    const homeLink = document.createElement("a");
    homeLink.href = "../index.html";
    homeLink.textContent = "← 返回个人园地";
    topNavigation.appendChild(homeLink);
    document.body.prepend(topNavigation);

    fetch("../index.html?v=20261026-1")
        .then(function (response) {
            if (!response.ok) {
                throw new Error("首页索引加载失败");
            }
            return response.text();
        })
        .then(function (html) {
            const indexDocument = new DOMParser().parseFromString(html, "text/html");
            const entries = [];
            const seenPaths = new Set();

            indexDocument
                .querySelectorAll("#articles-wrapper .article-box h2 a")
                .forEach(function (link) {
                    const rawHref = link.getAttribute("href");
                    if (!rawHref) {
                        return;
                    }

                    const url = new URL(rawHref, window.location.href);
                    let path = url.pathname;
                    if (/\/articles\/[^/.]+$/.test(path)) {
                        path += ".html";
                    }
                    if (!path.includes("/articles/") || seenPaths.has(path)) {
                        return;
                    }

                    seenPaths.add(path);
                    entries.push({
                        path: path,
                        title: link.textContent.trim()
                    });
                });

            let currentPath = window.location.pathname;
            if (/\/articles\/[^/.]+$/.test(currentPath)) {
                currentPath += ".html";
            }
            const currentIndex = entries.findIndex(function (entry) {
                return entry.path === currentPath;
            });

            if (currentIndex === -1) {
                return;
            }

            const olderArticle = entries[currentIndex + 1] || null;
            const newerArticle = entries[currentIndex - 1] || null;
            const bottomNavigation = document.createElement("nav");
            bottomNavigation.className = "article-bottom-navigation";
            bottomNavigation.setAttribute("aria-label", "上一篇与下一篇");

            bottomNavigation.appendChild(
                createAdjacentArticleLink(olderArticle, "上一篇", "older")
            );
            bottomNavigation.appendChild(
                createAdjacentArticleLink(newerArticle, "下一篇", "newer")
            );
            document.body.appendChild(bottomNavigation);
        })
        .catch(function () {
            // 索引暂时不可用时，顶部返回首页的链接仍然保留。
        });
}

function createAdjacentArticleLink(article, label, direction) {
    if (!article) {
        const spacer = document.createElement("span");
        spacer.className = "article-navigation-spacer";
        spacer.setAttribute("aria-hidden", "true");
        return spacer;
    }

    const link = document.createElement("a");
    link.href = article.path;
    link.className = "article-adjacent-link";
    link.dataset.direction = direction;

    const labelElement = document.createElement("span");
    labelElement.className = "article-navigation-label";
    labelElement.textContent = label;

    const titleElement = document.createElement("span");
    titleElement.className = "article-navigation-title";
    titleElement.textContent = article.title;

    link.append(labelElement, titleElement);
    return link;
}
