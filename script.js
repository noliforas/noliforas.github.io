document.addEventListener("DOMContentLoaded", function() {

    // ===========================
    // 功能一：历史上的今天 (新增功能)
    // ===========================
    function checkHistoryToday(data) {
        const today = new Date();
        // 获取当前的月和日，注意：JavaScript的月份是0-11，所以要+1
        // padStart(2, '0') 是为了把 "9" 变成 "09"，配合你的文件名格式
        const currentMonth = String(today.getMonth() + 1).padStart(2, '0');
        const currentDay = String(today.getDate()).padStart(2, '0');
        
        const historyContainer = document.getElementById('history-today');
        const historyList = document.getElementById('history-list');
        let hasHistory = false;

        // 遍历 JSON 数据
        // data 的结构是 Year -> Month -> Array of Articles
        Object.keys(data).forEach(year => {
            // 检查这一年有没有当前月份的数据
            if (data[year][currentMonth]) {
                const articles = data[year][currentMonth];
                
                articles.forEach(article => {
                    // 正则表达式：从URL中提取日期
                    // 假设 URL 包含 /20241123.html 这种格式
                    // \d{4}匹配年份, (\d{2})匹配月份, (\d{2})匹配日期
                    const match = article.url.match(/(\d{4})(\d{2})(\d{2})\.html/);
                    
                    // 如果 URL 符合日期格式，并且日期等于今天
                    if (match && match[3] === currentDay) {
                        hasHistory = true;
                        
                        const li = document.createElement('li');
                        li.style.marginBottom = "5px";
                        
                        // 计算是几年前
                        const yearsAgo = today.getFullYear() - parseInt(year);
                        const timeLabel = yearsAgo === 0 ? "今年" : `${yearsAgo}年前`;

                        li.innerHTML = `
                            <span style="color: #888; font-size: 0.85em; margin-right: 5px;">[${timeLabel}]</span>
                            <a href="${article.url}" style="color: #2c3e50; font-weight: 500;">${article.title}</a>
                        `;
                        historyList.appendChild(li);
                    }
                });
            }
        });

        // 只有当找到了历史文章，才显示这个卡片
        if (hasHistory) {
            historyContainer.style.display = 'block';
        }
    }


    // ===========================
    // 功能二：生成右侧文章归档 (读取 JSON)
    // ===========================
    const archiveContainer = document.getElementById('archive-container');

    if (archiveContainer) {
        fetch('articles.json')
            .then(response => {
                if (!response.ok) throw new Error("HTTP error " + response.status);
                return response.json();
            })
            .then(data => {
                // 1. 先运行“历史上的今天”检查
                checkHistoryToday(data);

                // 2. 再生成归档列表
                archiveContainer.innerHTML = ''; 
                const years = Object.keys(data).sort((a, b) => b - a);

                years.forEach(year => {
                    const details = document.createElement('details');
                    if (year === years[0]) details.open = true;

                    const summary = document.createElement('summary');
                    summary.innerText = year + "年";
                    summary.style.cursor = 'pointer'; 
                    summary.style.fontWeight = 'bold';
                    details.appendChild(summary);

                    const ul = document.createElement('ul');
                    const months = Object.keys(data[year]).sort((a, b) => b - a);

                    months.forEach(month => {
                        const monthLabel = document.createElement('li');
                        monthLabel.innerHTML = `<strong>${month}月</strong>`;
                        monthLabel.style.listStyle = 'none';
                        monthLabel.style.marginTop = '8px';
                        ul.appendChild(monthLabel);

                        const articles = data[year][month];
                        articles.forEach(article => {
                            const li = document.createElement('li');
                            const a = document.createElement('a');
                            a.href = article.url;
                            a.innerText = article.title;
                            a.style.display = 'block';
                            a.style.textDecoration = 'none';
                            a.style.color = '#555';
                            li.appendChild(a);
                            ul.appendChild(li);
                        });
                    });
                    details.appendChild(ul);
                    archiveContainer.appendChild(details);
                });
            })
            .catch(err => {
                console.error("加载失败:", err);
                archiveContainer.innerHTML = '加载失败';
            });
    }

    // ===========================
    // 功能三：自动分页逻辑
    // ===========================
    const itemsPerPage = 10; 
    const articles = document.querySelectorAll('.article-box');
    
    if (articles.length > 0) {
        let paginationContainer = document.getElementById('pagination');
        
        if (!paginationContainer) {
            paginationContainer = document.createElement('div');
            paginationContainer.id = 'pagination';
            paginationContainer.style.textAlign = 'center';
            paginationContainer.style.marginTop = '20px';
            paginationContainer.style.padding = '20px';
            const lastArticle = articles[articles.length - 1];
            lastArticle.parentNode.insertBefore(paginationContainer, lastArticle.nextSibling);
        }

        const totalPages = Math.ceil(articles.length / itemsPerPage);
        let currentPage = 1;

        function showPage(page) {
            const start = (page - 1) * itemsPerPage;
            const end = start + itemsPerPage;

            articles.forEach((article, index) => {
                if (index >= start && index < end) {
                    article.style.display = 'block';
                } else {
                    article.style.display = 'none';
                }
            });
            updateButtons(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        function updateButtons(page) {
            paginationContainer.innerHTML = '';
            
            const createBtn = (text, disabled, onClick) => {
                const btn = document.createElement('button');
                btn.innerText = text;
                btn.disabled = disabled;
                btn.onclick = onClick;
                btn.style.margin = '0 10px';
                btn.style.padding = '8px 16px';
                btn.style.cursor = disabled ? 'not-allowed' : 'pointer';
                btn.style.backgroundColor = disabled ? '#eee' : 'white';
                btn.style.border = '1px solid #ddd';
                btn.style.borderRadius = '20px';
                return btn;
            };

            const prevBtn = createBtn('← 上一页', page === 1, () => {
                currentPage--;
                showPage(currentPage);
            });
            paginationContainer.appendChild(prevBtn);

            const pageInfo = document.createElement('span');
            pageInfo.innerText = ` 第 ${page} / ${totalPages} 页 `;
            paginationContainer.appendChild(pageInfo);

            const nextBtn = createBtn('下一页 →', page === totalPages, () => {
                currentPage++;
                showPage(currentPage);
            });
            paginationContainer.appendChild(nextBtn);
        }

        showPage(1);
    }
});

    // ===========================
        // 功能五：阅读进度条
        // ===========================
        window.addEventListener('scroll', () => {
            const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (scrollTop / scrollHeight) * 100;
            
            const progressBar = document.getElementById('progress-bar');
            if(progressBar) {
                progressBar.style.width = scrolled + "%";
            }
        });

        // ===========================
// 全站文章搜索
// ===========================
document.addEventListener("DOMContentLoaded", function () {
    const searchForm = document.getElementById("search-form");
    const searchInput = document.getElementById("search-input");
    const searchStatus = document.getElementById("search-status");
    const searchResults = document.getElementById("search-results");
    const articlesWrapper = document.getElementById("articles-wrapper");

    // 如果当前页面没有搜索框，就不执行搜索代码。
    if (
        !searchForm ||
        !searchInput ||
        !searchStatus ||
        !searchResults ||
        !articlesWrapper
    ) {
        return;
    }

    let searchIndexPromise = null;
    let searchTimer = null;

    // 统一处理大小写、全角字符和空格。
    function normalizeText(text) {
        return String(text || "")
            .normalize("NFKC")
            .toLocaleLowerCase("zh-CN")
            .replace(/\s+/g, " ")
            .trim();
    }

    // 从首页的文章卡片中取得文章标题和链接。
    function collectArticleLinks() {
        const articles = [];
        const usedUrls = new Set();

        document.querySelectorAll(".article-box").forEach(function (card) {
            const link = card.querySelector("h2 a");

            // “简介”等没有文章链接的卡片不加入搜索。
            if (!link) {
                return;
            }

            const url = link.href;

            if (usedUrls.has(url)) {
                return;
            }

            usedUrls.add(url);

            articles.push({
                title: link.textContent.trim(),
                url: url,
                summary: card.textContent.replace(/\s+/g, " ").trim()
            });
        });

        return articles;
    }

    // 读取每一篇文章的正文，建立全文搜索索引。
    function buildSearchIndex() {
        if (searchIndexPromise) {
            return searchIndexPromise;
        }

        const articleLinks = collectArticleLinks();
        const cacheKey = "noliforas-search-index-v1-" + articleLinks.length;

        // 在同一个浏览器标签页中刷新时，尽量使用已经建立的索引。
        try {
            const cachedIndex = sessionStorage.getItem(cacheKey);

            if (cachedIndex) {
                searchIndexPromise = Promise.resolve(JSON.parse(cachedIndex));
                return searchIndexPromise;
            }
        } catch (error) {
            console.warn("无法读取搜索缓存：", error);
        }

        let completedCount = 0;

        searchIndexPromise = Promise.all(
            articleLinks.map(async function (article) {
                let content = article.summary;

                try {
                    const response = await fetch(article.url);

                    if (!response.ok) {
                        throw new Error("HTTP " + response.status);
                    }

                    const articleHTML = await response.text();
                    const parser = new DOMParser();
                    const articleDocument = parser.parseFromString(
                        articleHTML,
                        "text/html"
                    );

                    // 删除脚本和样式，避免把程序代码放进搜索内容。
                    articleDocument
                        .querySelectorAll("script, style, noscript")
                        .forEach(function (element) {
                            element.remove();
                        });

                    if (articleDocument.body) {
                        content = articleDocument.body.textContent
                            .replace(/\s+/g, " ")
                            .trim();
                    }
                } catch (error) {
                    // 某一篇文章读取失败时，仍然可以搜索它的标题和首页摘要。
                    console.warn("无法读取文章正文：", article.url, error);
                }

                completedCount += 1;
                searchStatus.textContent =
                    "第一次使用，正在准备全文搜索：" +
                    completedCount +
                    " / " +
                    articleLinks.length;

                return {
                    title: article.title,
                    url: article.url,
                    content: content
                };
            })
        ).then(function (searchIndex) {
            try {
                sessionStorage.setItem(
                    cacheKey,
                    JSON.stringify(searchIndex)
                );
            } catch (error) {
                console.warn("无法保存搜索缓存：", error);
            }

            return searchIndex;
        });

        return searchIndexPromise;
    }

    // 计算一篇文章与关键词的匹配程度。
    function calculateScore(article, completeQuery, terms) {
        const title = normalizeText(article.title);
        const content = normalizeText(article.content);
        const allText = title + " " + content;

        // 输入多个关键词时，文章必须包含全部关键词。
        const containsAllTerms = terms.every(function (term) {
            return allText.includes(term);
        });

        if (!containsAllTerms) {
            return -1;
        }

        let score = 0;

        // 标题完全一致时，排在最前面。
        if (title === completeQuery) {
            score += 1000;
        }

        // 标题包含完整搜索内容时，优先显示。
        if (title.includes(completeQuery)) {
            score += 500;
        }

        terms.forEach(function (term) {
            if (title.includes(term)) {
                score += 100;
            }

            // 正文中出现次数越多，相关程度稍高。
            const occurrenceCount = content.split(term).length - 1;
            score += Math.min(occurrenceCount, 10);
        });

        return score;
    }

    // 从正文中截取关键词附近的一小段文字。
    function createSnippet(content, terms) {
        const originalText = String(content || "")
            .replace(/\s+/g, " ")
            .trim();

        const normalizedContent = normalizeText(originalText);
        let matchPosition = -1;

        terms.forEach(function (term) {
            const position = normalizedContent.indexOf(term);

            if (
                position >= 0 &&
                (matchPosition === -1 || position < matchPosition)
            ) {
                matchPosition = position;
            }
        });

        if (matchPosition < 0) {
            matchPosition = 0;
        }

        const start = Math.max(0, matchPosition - 55);
        const end = Math.min(originalText.length, matchPosition + 115);

        return (
            (start > 0 ? "…" : "") +
            originalText.slice(start, end) +
            (end < originalText.length ? "…" : "")
        );
    }

    // 把搜索结果显示在页面中。
    function displayResults(matches, terms) {
        searchResults.replaceChildren();

        if (matches.length === 0) {
            const emptyMessage = document.createElement("p");
            emptyMessage.className = "search-empty";
            emptyMessage.textContent =
                "没有找到匹配的文章，请换一个关键词试试。";

            searchResults.appendChild(emptyMessage);
            return;
        }

        // 最多显示相关程度最高的30篇。
        matches.slice(0, 30).forEach(function (article) {
            const resultBox = document.createElement("article");
            resultBox.className = "search-result";

            const heading = document.createElement("h3");
            const link = document.createElement("a");

            link.href = article.url;
            link.textContent = article.title;

            heading.appendChild(link);

            const snippet = document.createElement("p");
            snippet.textContent = createSnippet(article.content, terms);

            resultBox.appendChild(heading);
            resultBox.appendChild(snippet);
            searchResults.appendChild(resultBox);
        });
    }

    // 清空搜索后恢复原来的文章列表。
    function clearSearch() {
        searchResults.hidden = true;
        searchResults.replaceChildren();
        articlesWrapper.hidden = false;
        searchStatus.textContent = "";
    }

    // 执行搜索。
    async function runSearch() {
        const completeQuery = normalizeText(searchInput.value);

        if (!completeQuery) {
            clearSearch();
            return;
        }

        const terms = completeQuery.split(" ").filter(Boolean);

        searchStatus.textContent = "正在搜索……";

        try {
            const searchIndex = await buildSearchIndex();

            // 建立索引期间，用户可能已经清空或改变了搜索内容。
            const latestQuery = normalizeText(searchInput.value);

            if (!latestQuery) {
                clearSearch();
                return;
            }

            if (latestQuery !== completeQuery) {
                runSearch();
                return;
            }

            const matches = searchIndex
                .map(function (article) {
                    return {
                        title: article.title,
                        url: article.url,
                        content: article.content,
                        score: calculateScore(
                            article,
                            completeQuery,
                            terms
                        )
                    };
                })
                .filter(function (article) {
                    return article.score >= 0;
                })
                .sort(function (firstArticle, secondArticle) {
                    if (secondArticle.score !== firstArticle.score) {
                        return secondArticle.score - firstArticle.score;
                    }

                    return firstArticle.title.localeCompare(
                        secondArticle.title,
                        "zh-CN"
                    );
                });

            articlesWrapper.hidden = true;
            searchResults.hidden = false;

            displayResults(matches, terms);

            if (matches.length > 30) {
                searchStatus.textContent =
                    "找到 " +
                    matches.length +
                    " 篇文章，显示最相关的30篇";
            } else {
                searchStatus.textContent =
                    "找到 " + matches.length + " 篇文章";
            }
        } catch (error) {
            console.error("搜索失败：", error);

            searchStatus.textContent =
                "搜索加载失败，请刷新页面后再试。";
        }
    }

    // 点击“搜索”按钮。
    searchForm.addEventListener("submit", function (event) {
        event.preventDefault();
        runSearch();
    });

    // 输入内容后自动搜索。
    searchInput.addEventListener("input", function () {
        window.clearTimeout(searchTimer);

        if (!searchInput.value.trim()) {
            clearSearch();
            return;
        }

        searchTimer = window.setTimeout(runSearch, 250);
    });
});