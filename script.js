// مفتاح التخزين
const STORAGE_KEY = 'savedPasswords';
let savedPasswords = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

// توليد كلمة مرور متناسقة
function generatePassword(length = 24) {
  const charset = "abcdefghijklmnopqrstuvwxyz" +
                  "ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
                  "0123456789" +
                  "_-";
  const array = new Uint32Array(length);
  window.crypto.getRandomValues(array);
  return Array.from(array, num => charset[num % charset.length]).join('');
}

// عرض اللودر مع نسبة تقدم
function showLoaderSequence(callback) {
  const steps = [
    { text: "جاري التحقق من كلمات المرور المسربة…", delay: 10000 },
    { text: "جاري مراجعة البيانات…",              delay: 20000 },
    { text: "جاري توليد كلمة المرور…",            delay: 15000 },
    { text: "جاري مراجعة كلمة المرور…",           delay: 5000  },
  ];
  const totalTime = steps.reduce((s, st) => s + st.delay, 0);
  const startTime = Date.now();
  const stepText = document.getElementById("stepText");
  const progress = document.querySelector(".progress");
  const percentText = document.getElementById("percentText");
  let currentStep = 0;

  document.getElementById("loader").classList.remove("hidden");
  progress.style.width = "0%";
  percentText.textContent = "0%";

  const interval = setInterval(() => {
    let elapsed = Date.now() - startTime;
    let pct = Math.min((elapsed / totalTime) * 100, 100);
    progress.style.width = pct + "%";
    percentText.textContent = Math.floor(pct) + "%";
  }, 100);

  (function next() {
    if (currentStep >= steps.length) {
      clearInterval(interval);
      document.getElementById("loader").classList.add("hidden");
      return callback();
    }
    stepText.textContent = steps[currentStep].text;
    setTimeout(() => {
      currentStep++;
      next();
    }, steps[currentStep].delay);
  })();
}

// حدث توليد كلمة المرور
document.getElementById("generateBtn").addEventListener("click", () => {
  document.getElementById("result").classList.add("hidden");
  showLoaderSequence(() => {
    const pwd = generatePassword(24);
    document.getElementById("password").textContent = pwd;
    document.getElementById("result").classList.remove("hidden");
  });
});

// نسخ
document.getElementById("copyBtn").addEventListener("click", () => {
  const pwd = document.getElementById("password").textContent;
  navigator.clipboard.writeText(pwd).then(() => {
    const msg = document.getElementById("copyMsg");
    msg.classList.remove("hidden");
    setTimeout(() => msg.classList.add("hidden"), 2000);
  });
});

// حفظ بدون تكرار (Base64)
document.getElementById("saveBtn").addEventListener("click", () => {
  const pwd = document.getElementById("password").textContent;
  const enc = btoa(pwd);
  if (!savedPasswords.includes(enc)) {
    savedPasswords.push(enc);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedPasswords));
    alert("تم حفظ كلمة المرور بنجاح!");
  } else {
    alert("هذه الكلمة محفوظة مسبقًا.");
  }
});

// رندر المحفوظات
const bookmarkIcon = document.getElementById("bookmarkIcon");
const savedSection  = document.getElementById("savedSection");
const closeSaved    = document.getElementById("closeSaved");

bookmarkIcon.onclick = () => {
  renderSavedList();
  savedSection.classList.remove("hidden");
};

// بناء القائمة
function renderSavedList() {
  const container = document.getElementById("savedList");
  container.innerHTML = '';
  savedPasswords.forEach((enc, idx) => {
    const div = document.createElement('div');
    div.className = 'saved-item';
    div.innerHTML = `
      <code id="code-${idx}">${enc}</code>
      <div>
        <button class="showBtn" data-idx="${idx}">إظهار</button>
        <button class="deleteBtn" data-idx="${idx}">حذف</button>
      </div>`;
    container.appendChild(div);
  });
  attachSavedEvents();
}

// أحداث إظهار وحذف
function attachSavedEvents() {
  document.querySelectorAll('.showBtn').forEach(btn => {
    btn.onclick = () => {
      const ans = prompt("للتحقق أنك لست روبوت، اكتب ناتج 4 + 3:");
      if (ans === '7') {
        const idx = btn.dataset.idx;
        document.getElementById(`code-${idx}`).textContent = atob(savedPasswords[idx]);
        btn.disabled = true;
      } else {
        alert("التحقق فشل.");
      }
    };
  });
  document.querySelectorAll('.deleteBtn').forEach(btn => {
    btn.onclick = () => {
      const idx = btn.dataset.idx;
      savedPasswords.splice(idx, 1);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedPasswords));
      renderSavedList();
    };
  });
}

// إغلاق Modal
document.addEventListener("click", e => {
  if (e.target === savedSection || e.target === closeSaved) {
    savedSection.classList.add("hidden");
  }
});
document.addEventListener("keydown", e => {
  if (e.key === "Escape") savedSection.classList.add("hidden");
});
