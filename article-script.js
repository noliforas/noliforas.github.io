document.addEventListener("DOMContentLoaded", function() {
    // 1. 自动创建一个进度条的 div (这样你就不用手动去改每个 HTML 了)
    const progressBar = document.createElement('div');
    progressBar.id = 'progress-bar';
    
    // 直接用 JS 定义进度条的样式，确保它一定长这样
    progressBar.style.position = 'fixed';
    progressBar.style.top = '0';
    progressBar.style.left = '0';
    progressBar.style.height = '3px';         // 进度条厚度
    progressBar.style.backgroundColor = '#70b1f1ff'; // 进度条颜色 (深蓝灰)
    progressBar.style.width = '0%';
    progressBar.style.zIndex = '9999';
    progressBar.style.transition = 'width 0.1s';
    
    // 把进度条加入到网页身体里
    document.body.appendChild(progressBar);

    // 2. 监听滚动事件，控制长度
    window.addEventListener('scroll', () => {
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        
        // 防止除以0的错误
        if (scrollHeight > 0) {
            const scrolled = (scrollTop / scrollHeight) * 100;
            progressBar.style.width = scrolled + "%";
        }
    });
});