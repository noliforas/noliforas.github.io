document.addEventListener("DOMContentLoaded", function() {

    // ===========================
    // 功能一：生成右侧文章归档 (读取 JSON)
    // ===========================
    const archiveContainer = document.getElementById('archive-container');

    // 只有当页面上有 archive-container 时才运行归档逻辑
    if (archiveContainer) {
        fetch('articles.json')
            .then(response => {
                if (!response.ok) throw new Error("HTTP error " + response.status);
                return response.json();
            })
            .then(data => {
                archiveContainer.innerHTML = ''; // 清空加载提示
                
                // 年份倒序
                const years = Object.keys(data).sort((a, b) => b - a);

                years.forEach(year => {
                    const details = document.createElement('details');
                    if (year === years[0]) details.open = true; // 默认展开最新年份

                    const summary = document.createElement('summary');
                    summary.innerText = year + "年";
                    // 强制设置样式以防CSS未加载
                    summary.style.cursor = 'pointer'; 
                    summary.style.fontWeight = 'bold';
                    details.appendChild(summary);

                    const ul = document.createElement('ul');
                    
                    // 月份倒序
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
                            a.style.textDecoration = 'none'; // 基础美化
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
                console.error("归档加载失败:", err);
                archiveContainer.innerHTML = '加载失败';
            });
    }

    // ===========================
    // 功能二：自动分页逻辑 (修复版)
    // ===========================
    const itemsPerPage = 10; // 每页显示 5 篇
    const articles = document.querySelectorAll('.article-box');
    
    // 如果找到了文章
    if (articles.length > 0) {
        let paginationContainer = document.getElementById('pagination');
        
        // 【关键修复】如果找不到放置按钮的盒子，脚本自动在文章列表末尾创建一个
        if (!paginationContainer) {
            console.log("未找到分页容器，正在自动创建...");
            paginationContainer = document.createElement('div');
            paginationContainer.id = 'pagination';
            paginationContainer.style.textAlign = 'center';
            paginationContainer.style.marginTop = '20px';
            paginationContainer.style.padding = '20px';
            
            // 尝试插入到文章列表后面
            const lastArticle = articles[articles.length - 1];
            lastArticle.parentNode.insertBefore(paginationContainer, lastArticle.nextSibling);
        }

        const totalPages = Math.ceil(articles.length / itemsPerPage);
        let currentPage = 1;

        function showPage(page) {
            const start = (page - 1) * itemsPerPage;
            const end = start + itemsPerPage;

            articles.forEach((article, index) => {
                // 显示当前页的文章，隐藏其他的
                if (index >= start && index < end) {
                    article.style.display = 'block';
                } else {
                    article.style.display = 'none';
                }
            });
            updateButtons(page);
            // 翻页后回到顶部
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        function updateButtons(page) {
            paginationContainer.innerHTML = '';
            
            // 创建按钮的通用样式函数
            const createBtn = (text, disabled, onClick) => {
                const btn = document.createElement('button');
                btn.innerText = text;
                btn.disabled = disabled;
                btn.onclick = onClick;
                // 添加一些基础样式，防止没有CSS时太丑
                btn.style.margin = '0 10px';
                btn.style.padding = '8px 16px';
                btn.style.cursor = disabled ? 'not-allowed' : 'pointer';
                return btn;
            };

            // 上一页
            const prevBtn = createBtn('← 上一页', page === 1, () => {
                currentPage--;
                showPage(currentPage);
            });
            paginationContainer.appendChild(prevBtn);

            // 显示页码
            const pageInfo = document.createElement('span');
            pageInfo.innerText = ` 第 ${page} / ${totalPages} 页 `;
            paginationContainer.appendChild(pageInfo);

            // 下一页
            const nextBtn = createBtn('下一页 →', page === totalPages, () => {
                currentPage++;
                showPage(currentPage);
            });
            paginationContainer.appendChild(nextBtn);
        }

        // 启动分页
        showPage(1);
    }
});