// 加载 JSON 并渲染博客归档
fetch('articles.json')
    .then(response => response.json())
    .then(data => renderArchive(data))
    .catch(error => console.error('加载文章数据失败:', error));

function renderArchive(data) {
    let archiveList = document.getElementById("archive-list");
    archiveList.innerHTML = "";  // 清空现有内容

    Object.keys(data).sort((a, b) => b - a).forEach(year => {
        let yearItem = document.createElement("li");
        let months = Object.keys(data[year]).sort((a, b) => b - a);
        let articleCount = months.reduce((sum, month) => sum + data[year][month].length, 0);

        yearItem.innerHTML = `<span class="toggle" onclick="toggleElement('year-${year}')">▶ ${year} (${articleCount})</span>`;
        let yearList = document.createElement("ul");
        yearList.id = `year-${year}`;
        yearList.classList.add("hidden");

        months.forEach(month => {
            let monthItem = document.createElement("li");
            let monthArticleCount = data[year][month].length;
            monthItem.innerHTML = `<span class="toggle" onclick="toggleElement('month-${year}-${month}')">▶ ${parseInt(month)}月 (${monthArticleCount})</span>`;

            let monthList = document.createElement("ul");
            monthList.id = `month-${year}-${month}`;
            monthList.classList.add("hidden");

            data[year][month].forEach(article => {
                let articleItem = document.createElement("li");
                articleItem.innerHTML = `<a href="${article.url}">${article.title}</a>`;
                monthList.appendChild(articleItem);
            });

            monthItem.appendChild(monthList);
            yearList.appendChild(monthItem);
        });

        yearItem.appendChild(yearList);
        archiveList.appendChild(yearItem);
    });
}

// 折叠/展开列表
function toggleElement(id) {
    let element = document.getElementById(id);
    if (element) {
        element.classList.toggle("hidden");
    }
}
