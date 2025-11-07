// 获取 URL 查询参数
function getQueryParams() {
  const params = {};
  const queryString = window.location.search.slice(1);
  const queries = queryString.split('&');

  for (const query of queries) {
    const [key, value] = query.split('=');
    if (key && value) {
      params[key] = decodeURIComponent(value);
    }
  }

  return params;
}

// 初始化支付倒计时时间
function initializeCounter() {
  const params = getQueryParams();
  let cnt = (1 + 2 + 3) * 10; // 默认支付时间

  if (params.debug === 'true' && params.cnt) {
    cnt = parseInt(params.cnt, 10);
  }

  return cnt;
}

// 关闭模态框
function closeModal() {
  var modalInstance = bootstrap.Modal.getInstance(document.getElementById('downloadModal'));
  if (modalInstance) {
    modalInstance.hide();
  }
}

// 定时器变量
let timer;
let autoCloseTimer;
let cnt = initializeCounter();

// 模态框显示事件
document.getElementById('downloadModal').addEventListener('show.bs.modal', function (event) {
  const button = event.relatedTarget;
  const downloadUrl = button.getAttribute('data-bs-download');
  const confirmButton = document.getElementById('confirmButton');

  confirmButton.disabled = true;
  confirmButton.textContent = `我已支付 (${cnt})`;

  timer = setInterval(function () {
    cnt--;
    if (cnt <= 0) {
      clearInterval(timer);
      confirmButton.disabled = false;
      confirmButton.textContent = '我已支付';
      confirmButton.onclick = function () {
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = '';
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        closeModal();
      };

      // 在支付倒计时结束后的 30 秒内，若用户没有点击【我已支付】按钮，则自动关闭
      autoCloseTimer = setTimeout(function () {
        closeModal();
      }, 30000);
    } else {
      confirmButton.textContent = `我已支付 (${cnt})`;
    }
  }, 1000);
});

// 模态框关闭事件
document.getElementById('downloadModal').addEventListener('hide.bs.modal', function () {
  clearInterval(timer);
  clearTimeout(autoCloseTimer);
  cnt = initializeCounter();
});

// 激活 Tooltip
var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
  return new bootstrap.Tooltip(tooltipTriggerEl)
})
