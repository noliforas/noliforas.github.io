document.addEventListener("DOMContentLoaded", () => {
    const archiveContainer = document.getElementById("archive-container");

    if (!archiveContainer) {
        console.error("未找到 #archive-container，检查 HTML 结构！");
        return;
    }

    fetch("articles.json")
        .then(response => {
            if (!response.ok) {
                throw new Error("无法加载文章数据");
            }
            return response.json();
        })
        .then(data => {
            archiveContainer.innerHTML = "";  // 清空“加载中...”的提示

            const years = Object.keys(data).sort((a, b) => b - a); // 年份从大到小排序

            years.forEach(year => {
                const yearDetails = document.createElement("details");
                const yearSummary = document.createElement("summary");
                yearSummary.textContent = year + " 年";
                yearDetails.appendChild(yearSummary);

                const months = Object.keys(data[year]).sort((a, b) => b - a); // 月份从大到小排序
                months.forEach(month => {
                    const monthDetails = document.createElement("details");
                    const monthSummary = document.createElement("summary");
                    monthSummary.textContent = month + " 月";
                    monthDetails.appendChild(monthSummary);

                    const articleList = document.createElement("ul");
                    data[year][month].forEach(article => {
                        const listItem = document.createElement("li");
                        const link = document.createElement("a");
                        link.href = article.url;
                        link.textContent = article.title;
                        listItem.appendChild(link);
                        articleList.appendChild(listItem);
                    });

                    monthDetails.appendChild(articleList);
                    yearDetails.appendChild(monthDetails);
                });

                archiveContainer.appendChild(yearDetails);
            });
        })
        .catch(error => {
            console.error("加载文章数据失败:", error);
            archiveContainer.textContent = "加载文章数据失败，请检查文件路径和结构！";
        });
});


