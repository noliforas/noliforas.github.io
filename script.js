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