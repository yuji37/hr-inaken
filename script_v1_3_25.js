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
    const data = new FormData(form);
    const body = [
      `相談種別: ${data.get("type") || ""}`,
      `お名前・会社名: ${data.get("name") || ""}`,
      `電話番号: ${data.get("tel") || ""}`,
      `メールアドレス: ${data.get("email") || ""}`,
      "",
      "相談内容:",
      data.get("message") || ""
    ].join("\n");
    location.href = `mailto:inaken@email.plala.or.jp?subject=${encodeURIComponent("稲建人材センターへの相談")}&body=${encodeURIComponent(body)}`;
  });
}
