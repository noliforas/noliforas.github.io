document.addEventListener("DOMContentLoaded", function() {

    // ===========================
    // 功能一：生成右侧文章归档 (基于 articles.json)
    // ===========================
    const archiveContainer = document.getElementById('archive-container');

    // 1. 读取 articles.json 文件
    fetch('articles.json')
        .then(response => {
            if (!response.ok) {
                throw new Error("HTTP error " + response.status);
            }
            return response.json();
        })
        .then(data => {
            // 清空"正在加载..."的提示
            archiveContainer.innerHTML = '';

            // 2. 获取年份并倒序排列 (最新的年份在上面)
            const years = Object.keys(data).sort((a, b) => b - a);

            years.forEach(year => {
                // 创建年份折叠框 <details>
                const details = document.createElement('details');
                // 默认展开最新的年份（你可以把 true 改成 false 让它默认闭合）
                if (year === years[0]) {
                    details.open = true;
                }

                const summary = document.createElement('summary');
                summary.innerText = year + "年";
                details.appendChild(summary);

                const ul = document.createElement('ul');

                // 3. 获取月份并倒序排列
                const months = Object.keys(data[year]).sort((a, b) => b - a);

                months.forEach(month => {
                    // 这里我们为了美观，在月份前面加个小标题，比如 "11月"
                    const monthLabel = document.createElement('li');
                    monthLabel.innerHTML = `<strong style="color:#2c3e50;">${month}月</strong>`;
                    monthLabel.style.listStyle = 'none'; // 月份标题不带圆点
                    monthLabel.style.marginTop = '10px';
                    ul.appendChild(monthLabel);

                    // 4. 遍历该月下的所有文章
                    const articles = data[year][month];
                    articles.forEach(article => {
                        const li = document.createElement('li');
                        const a = document.createElement('a');
                        a.href = article.url;   // 自动填入 JSON 里的 url
                        a.innerText = article.title; // 自动填入 JSON 里的 title
                        
                        // 为了美观，给链接加一点点缩进
                        a.style.display = 'block';
                        a.style.fontSize = '0.9em';
                        a.style.color = '#666';
                        
                        li.appendChild(a);
                        ul.appendChild(li);
                    });
                });

                details.appendChild(ul);
                archiveContainer.appendChild(details);
            });
        })
        .catch(function(error) {
            console.log('Hubo un problema con la petición Fetch:' + error.message);
            archiveContainer.innerHTML = '<p style="color:red;">归档加载失败，请检查 articles.json 格式</p>';
        });


    // ===========================
    // 功能二：中间文章列表的自动分页 (保留你之前的功能)
    // ===========================
    const itemsPerPage = 5; // 每页显示几篇
    const articles = document.querySelectorAll('.article-box');
    
    // 只有当页面上有文章块时才运行分页逻辑
    if (articles.length > 0) {
        const paginationContainer = document.getElementById('pagination');
        if (!paginationContainer) {
             // 如果找不到分页容器，就创建一个追加到 main-container 底部
             const newPageContainer = document.createElement('div');
             newPageContainer.id = 'pagination';
             document.getElementById('main-container').appendChild(newPageContainer);
        }
        
        const container = document.getElementById('pagination');
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
            container.innerHTML = '';
            
            const prevBtn = document.createElement('button');
            prevBtn.innerText = '← 上一页';
            prevBtn.className = 'page-btn';
            prevBtn.disabled = page === 1;
            prevBtn.onclick = () => { currentPage--; showPage(currentPage); };
            container.appendChild(prevBtn);

            const nextBtn = document.createElement('button');
            nextBtn.innerText = '下一页 →';
            nextBtn.className = 'page-btn';
            nextBtn.disabled = page === totalPages;
            nextBtn.onclick = () => { currentPage++; showPage(currentPage); };
            container.appendChild(nextBtn);
        }

        // 初始化显示第一页
        showPage(1);
    }
});