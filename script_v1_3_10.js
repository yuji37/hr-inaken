const toggle = document.querySelector("[data-menu-toggle]");
const nav = document.querySelector("[data-nav]");
if (toggle && nav) {
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
  });
}

const form = document.querySelector("[data-mail-form]");
if (form) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    
    // GAS API Endpoint (Please replace this URL with the actual deployed Web App URL)
    const GAS_API_URL = "https://script.google.com/macros/s/AKfycbwzjxjtelUWIwufZ2htqu9UO8124R_GNebdEAY_-SO5qppIvi3egRdHmkOMULno95T1Ww/exec";
    
    const submitBtn = form.querySelector("[data-submit-btn]");
    const statusDiv = form.querySelector("[data-form-status]");
    
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "送信中...";
    }
    if (statusDiv) {
      statusDiv.textContent = "送信中...";
      statusDiv.style.color = "#0c4a6e"; // Deep blue (rules 8)
    }
    
    const formData = new FormData(form);
    const payload = {
      type: formData.get("type") || "",
      name: formData.get("name") || "",
      tel: formData.get("tel") || "",
      email: formData.get("email") || "",
      message: formData.get("message") || ""
    };
    
    // Send form data asynchronously to GAS
    fetch(GAS_API_URL, {
      method: "POST",
      mode: "no-cors", // Bypasses CORS issues common with GAS Web App redirects
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    })
    .then(() => {
      if (statusDiv) {
        statusDiv.textContent = "送信が完了しました。ありがとうございました。";
        statusDiv.style.color = "green";
      }
      form.reset();
    })
    .catch((error) => {
      console.error("Submission error:", error);
      if (statusDiv) {
        statusDiv.textContent = "送信中にエラーが発生しました。お電話にてお問い合わせください。";
        statusDiv.style.color = "#c00000"; // Deep red (rules 8)
      }
    })
    .finally(() => {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "送信する";
      }
    });
  });
}

// --- 3. safeStorage オブジェクトの実装 ---
const safeStorage = {
  getItem(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn('LocalStorage is not accessible:', e);
      return null;
    }
  },
  setItem(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn('LocalStorage is not accessible:', e);
    }
  }
};

// --- 4. 文字サイズ調整機能 ---
function applyFontSize(size) {
  const html = document.documentElement;
  html.classList.remove('font-size-small', 'font-size-medium', 'font-size-large');
  html.classList.add(`font-size-${size}`);
  
  // ボタンの active クラスを更新
  document.querySelectorAll('.font-size-btn').forEach(btn => {
    if (btn.getAttribute('data-size') === size) {
      btn.classList.add('is-active');
      btn.setAttribute('aria-pressed', 'true');
    } else {
      btn.classList.remove('is-active');
      btn.setAttribute('aria-pressed', 'false');
    }
  });
}

// 初期化とリスナー設定
document.addEventListener('DOMContentLoaded', () => {
  const savedSize = safeStorage.getItem('preferred-font-size') || 'medium';
  applyFontSize(savedSize);

  // イベントデリゲーションで文字サイズ調整ボタンを検知
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.font-size-btn');
    if (btn) {
      const size = btn.getAttribute('data-size');
      if (size) {
        applyFontSize(size);
        safeStorage.setItem('preferred-font-size', size);
      }
    }
  });

  // 複数タブ・PWA同期
  window.addEventListener('storage', (event) => {
    if (event.key === 'preferred-font-size' && event.newValue) {
      applyFontSize(event.newValue);
    }
  });
});

// --- 5. スクロールアニメーション (Intersection Observer) ---
document.addEventListener('DOMContentLoaded', () => {
  const animateElements = document.querySelectorAll('[data-animate]');
  if ('IntersectionObserver' in window && animateElements.length > 0) {
    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -10% 0px',
      threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    animateElements.forEach(el => {
      el.classList.add('fade-in-up');
      observer.observe(el);
    });
  } else {
    // IntersectionObserver がサポートされていない場合は直接表示
    animateElements.forEach(el => el.classList.add('visible'));
  }
});

// --- 6. 簡易診断チェッカーのロジックとデータ ---
const checkerData = {
  companies: {
    steps: [
      {
        id: 'co-q1',
        text: 'どのような業務での採用を検討されていますか？',
        options: [
          { text: '工場での製造・食品加工・梱包ラインなど', next: 'co-q2' },
          { text: 'オフィスワーク・翻訳・IT・エンジニアなど', next: 'co-result-gijutsu' },
          { text: '建設現場での直接の現場作業', next: 'co-result-kensetsu' },
          { text: 'その他・判断がつかない', next: 'co-q2' }
        ]
      },
      {
        id: 'co-q2',
        text: '採用したい人材の日本語レベルの希望は？',
        options: [
          { text: '日常会話レベル（ある程度指示が理解できる）', next: 'co-result-tokutei' },
          { text: 'ビジネスレベル（複雑な指示やメール作成が可能）', next: 'co-result-gijutsu' },
          { text: '簡単な挨拶レベルで、作業手順が分かればOK', next: 'co-result-tokutei' }
        ]
      }
    ],
    results: {
      'co-result-tokutei': {
        title: '「特定技能」での受入れが適しています',
        desc: '製造業や梱包作業など、特定の産業分野において即戦力となる外国人材を受け入れる在留資格です。稲建人材センターでは、特定技能人材の紹介および受入れ手続き、生活支援まで一貫してサポートしています。',
        ctaText: '特定技能の採用について相談する',
        ctaUrl: 'contact.html?type=company&topic=tokutei'
      },
      'co-result-gijutsu': {
        title: '「技術・人文知識・国際業務」での採用が適しています',
        desc: '専門的な知識やスキルを要するオフィスワーク、翻訳通訳、エンジニア、貿易事務などに適した在留資格です。学歴（大学卒業など）や実務経験などの要件確認が必要です。',
        ctaText: '専門職の採用について相談する',
        ctaUrl: 'contact.html?type=company&topic=gijutsu'
      },
      'co-result-kensetsu': {
        title: '建設現場への「派遣」は法令上禁止されています',
        desc: '建設業務への労働者派遣は法令で禁止されています。ただし、「職業紹介」による直接雇用での採用や、適法な「請負契約」による施工体制構築など、別形態でのご支援が可能な場合があります。詳細を確認させてください。',
        ctaText: '建設分野の採用について相談する',
        ctaUrl: 'contact.html?type=company&topic=kensetsu'
      }
    }
  },
  workers: {
    steps: [
      {
        id: 'wo-q1',
        text: '現在、日本でどのようなビザ（在留資格）を持っていますか？',
        options: [
          { text: '家族滞在 / 留学', next: 'wo-q2' },
          { text: '特定技能 / 技能実習', next: 'wo-result-tokutei' },
          { text: '技術・人文知識・国際業務 / その他就労ビザ', next: 'wo-result-gijutsu' },
          { text: '日本人の配偶者等 / 永住者 / 定住者', next: 'wo-result-freer' }
        ]
      },
      {
        id: 'wo-q2',
        text: '週に何時間くらい働きたいですか？',
        options: [
          { text: '週28時間以内（アルバイトとして働きたい）', next: 'wo-result-parttime' },
          { text: 'フルタイム（週40時間程度）でしっかり働きたい', next: 'wo-q3' }
        ]
      },
      {
        id: 'wo-q3',
        text: 'ビザの変更（特定技能などへの切り替え）を希望しますか？',
        options: [
          { text: '変更してフルタイムで働きたい', next: 'wo-result-tokutei' },
          { text: '今のビザのままで働きたい（まずは相談）', next: 'wo-result-consult' }
        ]
      }
    ],
    results: {
      'wo-result-tokutei': {
        title: '「特定技能」でのフルタイム就労がおすすめです',
        desc: '日本の製造業や食品加工、外食などの分野で、即戦力としてフルタイムで働くことができます。ビザの切り替え手続きから、安心できる就職先のご紹介までトータルでサポートします。',
        ctaText: '特定技能の仕事について相談する',
        ctaUrl: 'contact.html?type=worker&topic=tokutei'
      },
      'wo-result-gijutsu': {
        title: '専門職（技術・人文知識・国際業務など）の仕事がおすすめです',
        desc: 'あなたの学歴やこれまでの職歴を活かした、専門的な事務職、翻訳通訳、エンジニア、貿易業務などの仕事を探すことができます。',
        ctaText: '専門職の仕事について相談する',
        ctaUrl: 'contact.html?type=worker&topic=gijutsu'
      },
      'wo-result-freer': {
        title: '職種の制限なく、希望に合わせた仕事が選べます',
        desc: '「永住者」「定住者」「日本人の配偶者等」などのビザをお持ちの場合、就労の職種制限や時間制限はありません。ご希望の現場や条件に合わせた最適な仕事をご紹介します。',
        ctaText: '希望条件を伝えて相談する',
        ctaUrl: 'contact.html?type=worker&topic=freer'
      },
      'wo-result-parttime': {
        title: '資格外活動（週28時間以内）でのアルバイトが可能です',
        desc: '留学生や家族滞在の方は、資格外活動許可の範囲内（週28時間以内）でアルバイトが可能です。学業やご家族の生活と両立しやすいお仕事をご紹介します。',
        ctaText: 'アルバイトについて相談する',
        ctaUrl: 'contact.html?type=worker&topic=parttime'
      },
      'wo-result-consult': {
        title: 'まずは個別面談で一緒に考えましょう',
        desc: '現在のビザでどのようなお仕事ができるか、ビザ変更が必要かなど、あなたの状況に合わせて個別にアドバイスいたします。',
        ctaText: '個別に面談を予約する',
        ctaUrl: 'contact.html?type=worker&topic=consult'
      }
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('interactive-checker');
  if (!container) return;

  let currentType = 'companies'; // 'companies' or 'workers'
  let currentStepIndex = 0;
  const history = [];

  const tabCompanies = document.getElementById('checker-tab-companies');
  const tabWorkers = document.getElementById('checker-tab-workers');
  const body = document.getElementById('checker-body');

  function renderStep() {
    const data = checkerData[currentType];
    const step = data.steps[currentStepIndex];

    body.innerHTML = `
      <div class="checker-step is-active">
        <div class="checker-question">${step.text}</div>
        <div class="checker-options">
          ${step.options.map((opt, i) => `
            <button type="button" class="checker-option-btn" data-next="${opt.next}">${opt.text}</button>
          `).join('')}
        </div>
        ${history.length > 0 ? `<button type="button" class="checker-back-btn" id="checker-back">前の質問に戻る</button>` : ''}
      </div>
    `;

    // オプションボタンのイベント
    body.querySelectorAll('.checker-option-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const next = btn.getAttribute('data-next');
        history.push({ stepIndex: currentStepIndex });
        
        if (next.startsWith('co-result-') || next.startsWith('wo-result-')) {
          renderResult(next);
        } else {
          const nextIndex = data.steps.findIndex(s => s.id === next);
          if (nextIndex !== -1) {
            currentStepIndex = nextIndex;
            renderStep();
          }
        }
      });
    });

    // 戻るボタンのイベント
    const backBtn = document.getElementById('checker-back');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        const prev = history.pop();
        if (prev) {
          currentStepIndex = prev.stepIndex;
          renderStep();
        }
      });
    }
  }

  function renderResult(resultId) {
    const data = checkerData[currentType];
    const result = data.results[resultId];

    body.innerHTML = `
      <div class="checker-result is-active">
        <h3 class="checker-result-title">${result.title}</h3>
        <p class="checker-result-desc">${result.desc}</p>
        <div class="checker-result-actions">
          <a class="button primary" href="${result.ctaUrl}">${result.ctaText}</a>
          <button type="button" class="checker-back-btn" id="checker-reset">最初からやり直す</button>
        </div>
      </div>
    `;


    const resetBtn = document.getElementById('checker-reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        currentStepIndex = 0;
        history.length = 0;
        renderStep();
      });
    }
  }

  function switchTab(type) {
    currentType = type;
    currentStepIndex = 0;
    history.length = 0;

    if (type === 'companies') {
      tabCompanies.classList.add('is-active');
      tabWorkers.classList.remove('is-active');
    } else {
      tabCompanies.classList.remove('is-active');
      tabWorkers.classList.add('is-active');
    }

    renderStep();
  }

  if (tabCompanies && tabWorkers) {
    tabCompanies.addEventListener('click', () => switchTab('companies'));
    tabWorkers.addEventListener('click', () => switchTab('workers'));
  }

  // 初期読み込み
  switchTab('companies');
});

// --- 7. お問い合わせフォームのクエリパラメータ連動 ---
document.addEventListener('DOMContentLoaded', () => {
  const selectType = document.querySelector('select[name="type"]');
  const textareaMessage = document.querySelector('textarea[name="message"]');
  if (selectType && textareaMessage) {
    const params = new URLSearchParams(window.location.search);
    const type = params.get('type');
    const topic = params.get('topic');

    if (type === 'company') {
      selectType.value = '企業として人材を相談したい';
      if (topic === 'tokutei') {
        textareaMessage.value = '特定技能での採用を検討しています。詳しくお話を聞かせてください。';
      } else if (topic === 'gijutsu') {
        textareaMessage.value = '専門職（技術・人文知識・国際業務）の採用を検討しています。要件確認などを含め、相談させてください。';
      } else if (topic === 'kensetsu') {
        textareaMessage.value = '建設現場での受入れ（職業紹介・請負等）について相談したいです。';
      }
    } else if (type === 'worker') {
      selectType.value = '仕事を探したい';
      if (topic === 'tokutei') {
        textareaMessage.value = '特定技能の仕事を探しています。ビザの切り替えや求人について教えてください。';
      } else if (topic === 'gijutsu') {
        textareaMessage.value = '専門職（技術・人文知識・国際業務）の仕事を探しています。どのような求人がありますか？';
      } else if (topic === 'freer') {
        textareaMessage.value = '現在持っているビザで働ける仕事を探しています。希望条件に合う仕事を紹介してください。';
      } else if (topic === 'parttime') {
        textareaMessage.value = '週28時間以内で働けるアルバイトを探しています。';
      } else if (topic === 'consult') {
        textareaMessage.value = '自分に合う仕事やビザについて個別に相談したいです。面談の予約をお願いします。';
      }
    }
  }
});

// --- 8. 実績カウンターのカウントアップアニメーション (v1.0.4) ---
function startCounter(el) {
  const target = parseInt(el.getAttribute('data-count'), 10);
  if (isNaN(target)) return;
  const duration = 2000; // 2秒
  const startTime = performance.now();
  
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // イージング（easeOutQuad）
    const easeProgress = progress * (2 - progress);
    
    el.textContent = Math.floor(easeProgress * target);
    
    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      el.textContent = target; // 最終調整
    }
  }
  requestAnimationFrame(update);
}

document.addEventListener('DOMContentLoaded', () => {
  const countElements = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window && countElements.length > 0) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          startCounter(entry.target);
          counterObserver.unobserve(entry.target); // 一度実行したら終了
        }
      });
    }, { threshold: 0.3 });
    
    countElements.forEach(el => counterObserver.observe(el));
  } else {
    // 非サポート時は直ちに数値を表示
    countElements.forEach(el => {
      el.textContent = el.getAttribute('data-count');
    });
  }
});

// --- 9. フローティングお問い合わせボタンの表示制御 (v1.0.4) ---
document.addEventListener('DOMContentLoaded', () => {
  const floatingBtn = document.querySelector('.floating-cta');
  if (floatingBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        floatingBtn.classList.add('is-visible');
      } else {
        floatingBtn.classList.remove('is-visible');
      }
    }, { passive: true });
  }
});

