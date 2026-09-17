(()=>{
  const root=document.documentElement;
  const saved=localStorage.getItem("qb-language");
  const automatic=(navigator.language||"en").toLowerCase().startsWith("pl")?"pl":"en";

  function setLanguage(language){
    root.dataset.language=language;
    root.lang=language;
    localStorage.setItem("qb-language",language);
    document.querySelectorAll("[data-set]").forEach(button=>{
      button.classList.toggle("on",button.dataset.set===language);
    });
  }

  document.querySelectorAll("[data-set]").forEach(button=>{
    button.addEventListener("click",()=>setLanguage(button.dataset.set));
  });

  setLanguage(saved==="pl"||saved==="en"?saved:automatic);

  const stateCards=[...document.querySelectorAll(".state-card")];
  stateCards.forEach(card=>{
    card.addEventListener("click",()=>{
      const willOpen=card.getAttribute("aria-expanded")!=="true";
      stateCards.forEach(other=>other.setAttribute("aria-expanded","false"));
      card.setAttribute("aria-expanded",willOpen?"true":"false");
    });
  });
})();