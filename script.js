const STORAGE_KEY = "pixelDevQuest_v2";
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
};
const defaultState = {
  coins: 0, xp: 0, streak: 0, lastStudyDate: null, completedDate: null,
  completedQuests: [], tracks: {html:[],js:[],py:[],git:[]}, inventory: [],
  customTracks: [], firstStudyDate: null, weeklyClaimed: [], weeklyChecks: {}
};
let state;
try {
  const old = JSON.parse(localStorage.getItem(STORAGE_KEY) || localStorage.getItem("pixelDevQuest_v1") || "{}");
  state = {...defaultState, ...old};
} catch { state = {...defaultState}; }
state.tracks = {...defaultState.tracks, ...(state.tracks || {})};
state.inventory = state.inventory || [];
state.customTracks = state.customTracks || [];
state.weeklyClaimed = state.weeklyClaimed || [];
state.weeklyChecks = state.weeklyChecks || {};
const questPool = [
  {title:'SESSÃO DE FOCO',desc:'Estude por 25 minutos sem notificações ou distrações.',reward:20,xp:25},
  {title:'REVISÃO ATIVA',desc:'Feche suas anotações e tente lembrar os pontos principais do último estudo.',reward:20,xp:25},
  {title:'RESUMO DE 5 LINHAS',desc:'Resuma o que estudou hoje em até cinco linhas.',reward:15,xp:20},
  {title:'EXPLIQUE COM SUAS PALAVRAS',desc:'Explique um conceito aprendido como se estivesse ensinando alguém.',reward:20,xp:25},
  {title:'PERGUNTAS PARA O FUTURO',desc:'Escreva três perguntas sobre o tema que está estudando.',reward:15,xp:20},
  {title:'REVISE UM ERRO',desc:'Volte a um exercício em que errou e descubra por que a solução não funcionou.',reward:25,xp:30},
  {title:'BLOCO SEM DISTRAÇÕES',desc:'Faça um bloco de estudo de 30 minutos com o celular longe.',reward:25,xp:30},
  {title:'FLASHCARDS',desc:'Crie ou revise cinco cartões de pergunta e resposta sobre o conteúdo.',reward:15,xp:20},
  {title:'MAPA DE CONCEITOS',desc:'Desenhe um mapa simples relacionando os conceitos estudados.',reward:20,xp:25},
  {title:'LEITURA COM OBJETIVO',desc:'Leia uma seção do material e anote a ideia mais importante.',reward:15,xp:20},
  {title:'PRATIQUE A RECORDAÇÃO',desc:'Liste tudo que lembra do tema antes de consultar suas anotações.',reward:20,xp:25},
  {title:'DIVIDA UMA DIFICULDADE',desc:'Escolha um assunto difícil e divida-o em três partes menores.',reward:15,xp:20},
  {title:'PLANEJE A SESSÃO',desc:'Defina uma meta clara e realista antes de começar a estudar.',reward:15,xp:20},
  {title:'REVISE ANOTAÇÕES ANTIGAS',desc:'Releia anotações de outro dia e complemente o que estiver faltando.',reward:15,xp:20},
  {title:'ESTUDO EM POMODORO',desc:'Complete um ciclo de 25 minutos de estudo e 5 minutos de pausa.',reward:20,xp:25},
  {title:'PRATIQUE SEM CONSULTAR',desc:'Tente resolver uma atividade sem olhar a solução pronta.',reward:25,xp:30},
  {title:'COMPARE DUAS SOLUÇÕES',desc:'Compare duas formas de resolver o mesmo problema e anote diferenças.',reward:25,xp:30},
  {title:'CRIE UM EXEMPLO PRÓPRIO',desc:'Invente um exemplo simples para demonstrar um conceito que aprendeu.',reward:20,xp:25},
  {title:'REGISTRO DE APRENDIZADO',desc:'Anote uma coisa que entendeu melhor hoje e uma que ainda precisa revisar.',reward:15,xp:20},
  {title:'ORGANIZE SEU MATERIAL',desc:'Organize arquivos, anotações ou links úteis para sua próxima sessão.',reward:15,xp:20},
  {title:'PESQUISE UMA DÚVIDA',desc:'Investigue uma dúvida específica e registre a resposta com suas palavras.',reward:20,xp:25},
  {title:'REVISÃO ESPAÇADA',desc:'Revise um tema estudado há alguns dias para reforçar a memória.',reward:20,xp:25},
  {title:'CHECKPOINT DE PROGRESSO',desc:'Confira suas metas da semana e marque o que já avançou.',reward:15,xp:20},
  {title:'ESTUDO EM ETAPAS',desc:'Estude um tópico por 15 minutos e depois faça uma pausa curta.',reward:15,xp:20},
  {title:'TESTE SEU ENTENDIMENTO',desc:'Crie cinco perguntas sobre o tema e tente respondê-las sem consulta.',reward:20,xp:25},
  {title:'LEIA COM ATENÇÃO',desc:'Leia o material devagar e destaque apenas as ideias essenciais.',reward:15,xp:20},
  {title:'PRATIQUE A CONCENTRAÇÃO',desc:'Conclua uma pequena tarefa de estudo antes de abrir outras abas.',reward:20,xp:25},
  {title:'FAÇA UMA PAUSA CONSCIENTE',desc:'Depois de estudar por 20 minutos, faça uma pausa curta longe da tela.',reward:15,xp:20},
  {title:'REESCREVA UMA ANOTAÇÃO',desc:'Transforme uma anotação confusa em uma explicação clara e organizada.',reward:15,xp:20},
  {title:'IDENTIFIQUE LACUNAS',desc:'Liste os pontos que ainda não entendeu e escolha um para investigar.',reward:20,xp:25},
  {title:'RELEMBRE SEM OLHAR',desc:'Escreva os passos de um processo de memória e confira depois.',reward:20,xp:25},
  {title:'META PEQUENA, META FEITA',desc:'Escolha uma tarefa que possa terminar em 15 minutos e conclua-a.',reward:15,xp:20},
  {title:'ESTUDE UM TERMO NOVO',desc:'Aprenda um termo ou conceito novo e escreva uma definição simples.',reward:15,xp:20},
  {title:'REVISÃO DE FIM DE SESSÃO',desc:'Reserve cinco minutos para revisar o que acabou de estudar.',reward:15,xp:20},
  {title:'CRIE UM GUIA RÁPIDO',desc:'Monte uma pequena lista de passos para lembrar como fazer uma tarefa.',reward:20,xp:25},
  {title:'PRATIQUE A PACIÊNCIA',desc:'Dedique 10 minutos extras a um ponto que costuma parecer difícil.',reward:20,xp:25},
  {title:'RETOME DE ONDE PAROU',desc:'Continue uma atividade iniciada anteriormente sem começar outra nova.',reward:20,xp:25},
  {title:'ESTUDE COM UMA PERGUNTA',desc:'Comece a sessão com uma pergunta e procure respondê-la durante o estudo.',reward:20,xp:25},
  {title:'ENSINE POR ESCRITO',desc:'Escreva uma explicação curta e didática sobre o tema de hoje.',reward:20,xp:25},
  {title:'REVISE SUA ROTINA',desc:'Identifique uma distração frequente e defina como reduzi-la amanhã.',reward:15,xp:20},
  {title:'PRÁTICA DELIBERADA',desc:'Repita uma atividade que exige esforço, prestando atenção ao ponto difícil.',reward:25,xp:30},
  {title:'ORGANIZE POR PRIORIDADE',desc:'Ordene os tópicos pendentes do mais importante ao menos urgente.',reward:15,xp:20},
  {title:'ESTUDE UM MATERIAL NOVO',desc:'Consulte uma fonte confiável diferente e compare com suas anotações.',reward:20,xp:25},
  {title:'RECUPERE UMA DÚVIDA ANTIGA',desc:'Volte a uma pergunta que deixou em aberto e tente respondê-la.',reward:20,xp:25},
  {title:'FAÇA UMA AUTOAVALIAÇÃO',desc:'Dê uma nota de 1 a 5 para seu entendimento e justifique a nota.',reward:15,xp:20},
  {title:'SESSÃO DE LEITURA TÉCNICA',desc:'Leia um trecho de documentação, artigo ou apostila e registre um insight.',reward:20,xp:25},
  {title:'CONSTRUA UMA ROTINA',desc:'Escolha horário e local para a próxima sessão de estudo e deixe tudo pronto.',reward:15,xp:20},
  {title:'CELEBRE UMA CONQUISTA',desc:'Registre uma dificuldade que superou recentemente e o que ajudou.',reward:15,xp:20},
  {title:'REVISÃO SEMANAL',desc:'Revise seus registros da semana e escolha um foco para a próxima.',reward:25,xp:30},
  {title:'FECHAMENTO COM INTENÇÃO',desc:'Escreva o que aprendeu hoje e qual será seu primeiro passo amanhã.',reward:15,xp:20}
];
const weeklyProjects = [
  {title:"PROJETO: MINI PORTFÓLIO",desc:"Crie uma página pessoal com apresentação, habilidades e pelo menos um projeto. Use HTML e CSS; adicione JavaScript para um desafio extra."},
  {title:"PROJETO: LISTA DE TAREFAS",desc:"Monte uma lista de tarefas que permita adicionar, concluir e remover itens. Pratique DOM, eventos e salvamento local."},
  {title:"PROJETO: QUIZ DE PROGRAMAÇÃO",desc:"Crie um quiz com pelo menos cinco perguntas, opções de resposta e uma pontuação final."},
  {title:"PROJETO: CALCULADORA",desc:"Construa uma calculadora simples com operações básicas e uma interface organizada."},
  {title:"PROJETO: CARTÃO DE ESTUDOS",desc:"Crie flashcards que mostrem uma pergunta e revelem a resposta. Inclua pelo menos cinco cartões."},
  {title:"PROJETO: PAINEL DE HÁBITOS",desc:"Crie um painel para marcar hábitos de estudo e visualizar o progresso da semana."},
  {title:"PROJETO: MINI JOGO",desc:"Faça um jogo simples de adivinhar número, pedra-papel-tesoura ou clicar no alvo usando JavaScript."}
];
const baseTracks = {
  html:{name:"HTML5 + CSS3",icon:"5",subtitle:"ARQUITETO DA WEB",description:"Crie páginas, layouts responsivos e interfaces bonitas.",tag:"INICIANTE",items:["Estrutura semântica HTML","Tags, links e formulários","CSS: cores, fontes e box model","Flexbox e Grid","Projeto: landing page"],color:"html-logo"},
  js:{name:"JAVASCRIPT",icon:"JS",subtitle:"MESTRE DA LÓGICA",description:"Dê vida às páginas com lógica, eventos e interatividade.",tag:"INICIANTE",items:["Variáveis e tipos de dados","Condições e loops","Funções e arrays","DOM e eventos","Projeto: lista de tarefas"],color:"js-logo"},
  py:{name:"PYTHON",icon:"Py",subtitle:"ALQUIMISTA DA AUTOMAÇÃO",description:"Aprenda a automatizar tarefas e resolver problemas.",tag:"PRÓXIMA FASE",items:["Sintaxe e variáveis","If, elif e else","Laços e coleções","Funções e módulos","Projeto: automação simples"],color:"py-logo"},
  git:{name:"GIT + GITHUB",icon:"⌘",subtitle:"GUARDIÃO DO CÓDIGO",description:"Versione seus projetos e monte um portfólio profissional.",tag:"ESSENCIAL",items:["Repositório e commits","Push, pull e clone","Branches e merge","README bem estruturado","Publicar um projeto"],color:"git-logo"}
};
function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}
function dayNumber(){
  if(!state.firstStudyDate)return 1;
  const start=new Date(state.firstStudyDate+"T00:00:00");
  const now=new Date(today()+"T00:00:00");
  return Math.max(1,Math.floor((now-start)/86400000)+1);
}
function level(){return Math.floor(state.xp/100)+1;}
function currentCompleted(){return state.completedDate===today()?state.completedQuests:[];}
function dailyQuests(){
  // Deterministic variety by date: three distinct challenges each day.
  const seed=Math.floor(new Date(today()+"T00:00:00").getTime()/86400000);
  const start=(seed*7)%questPool.length;
  const chosen=[];
  for(let i=0;i<questPool.length&&chosen.length<3;i++){
    const item=questPool[(start+i*5)%questPool.length];
    if(!chosen.some(q=>q.title===item.title))chosen.push({...item,id:"q"+i});
  }
  return chosen;
}
let activeQuests=dailyQuests();
function showToast(message){
  const toast=document.getElementById("toast");toast.textContent=message;toast.classList.add("show");
  clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>toast.classList.remove("show"),2600);
}
function renderQuests(){
  const completed=currentCompleted();
  document.getElementById("questList").innerHTML=activeQuests.map((q,i)=>{
    const done=completed.includes(q.title);
    return `<article class="quest-card ${done?'completed':''}"><div class="quest-number">${done?'✓':String(i+1).padStart(2,"0")}</div><div><h3>${q.title}</h3><p>${q.desc}</p></div><div class="quest-reward">+${q.reward} ◉</div><button class="quest-check" data-quest="${i}" ${done?'disabled':''}>${done?'✓ CONCLUÍDA':'COMPLETAR +' + q.reward}</button></article>`;
  }).join("");
  document.querySelectorAll("[data-quest]").forEach(btn=>btn.addEventListener("click",()=>completeQuest(Number(btn.dataset.quest))));
  document.getElementById("doneCount").textContent=completed.length;
  document.getElementById("questMessage").textContent=completed.length===3?"Todas as missões concluídas! Você mandou muito bem.":`${3-completed.length} missão(ões) para concluir a rotina de hoje.`;
  document.querySelector(".reward-total").innerHTML=`RECOMPENSA MÁXIMA: <b>+${activeQuests.reduce((sum,q)=>sum+q.reward,0)} ◉</b>`;
}
function completeQuest(index){
  const q=activeQuests[index];if(!q)return;
  if(state.completedDate!==today()){state.completedDate=today();state.completedQuests=[];}
  if(state.completedQuests.includes(q.title))return;
  const wasEmpty=state.completedQuests.length===0;
  state.completedQuests.push(q.title);state.coins+=q.reward;state.xp+=q.xp;
  if(wasEmpty){
    const yesterday=new Date();yesterday.setDate(yesterday.getDate()-1);
    const y=`${yesterday.getFullYear()}-${String(yesterday.getMonth()+1).padStart(2,"0")}-${String(yesterday.getDate()).padStart(2,"0")}`;
    state.streak=state.lastStudyDate===y?state.streak+1:(state.lastStudyDate===today()?state.streak:1);
    state.lastStudyDate=today();
    if(!state.firstStudyDate)state.firstStudyDate=today();
  }
  save();render();showToast(`Missão concluída! +${q.reward} moedas e +${q.xp} XP`);
}
function renderTracks(){
  const grid=document.getElementById("tracksGrid");
  const custom=state.customTracks||[];
  // Preserve base tracks and append custom tracks.
  grid.innerHTML=Object.entries(baseTracks).map(([key,t])=>trackCard(key,t,false)).join("")+
    custom.map(t=>trackCard(t.id,t,true)).join("");
  grid.querySelectorAll(".skill-list input").forEach(input=>{
    const track=input.dataset.track,index=Number(input.dataset.index);
    input.checked=(state.tracks[track]||[]).includes(index);
    input.onchange=()=>{
      const list=state.tracks[track]||[];
      state.tracks[track]=input.checked?[...new Set([...list,index])]:list.filter(i=>i!==index);
      if(input.checked){state.xp+=10;showToast("Habilidade desbloqueada! +10 XP");}
      save();render();
    };
  });
  grid.querySelectorAll("[data-remove-card]").forEach(btn=>btn.addEventListener("click",()=>removeTrack(btn.dataset.removeCard)));
  Object.entries(baseTracks).forEach(([key])=>updateTrackProgress(key));
  custom.forEach(t=>updateTrackProgress(t.id));
  document.getElementById("customTrackList").innerHTML=custom.length?custom.map(t=>`<span class="custom-track-chip"><b>${escapeHTML(t.icon||t.name.slice(0,2).toUpperCase())}</b>${escapeHTML(t.name)}<button class="remove-track" data-remove="${t.id}" title="Remover ${escapeHTML(t.name)}" aria-label="Remover ${escapeHTML(t.name)}">×</button></span>`).join(""):"<span style='color:var(--muted);font-size:18px'>Nenhuma trilha personalizada ainda.</span>";
  document.querySelectorAll("[data-remove]").forEach(btn=>btn.addEventListener("click",()=>removeTrack(btn.dataset.remove)));
}
function trackCard(key,t,isCustom){
  const done=(state.tracks[key]||[]).length,percent=Math.round(done/t.items.length*100);
  return `<article class="track-card panel ${isCustom?'custom-track-card':''}">
    <div class="track-top"><div class="track-logo ${t.color||'js-logo'}">${escapeHTML(t.icon||t.name.slice(0,2).toUpperCase())}</div><div><h3>${escapeHTML(t.name)}</h3><small>${escapeHTML(t.subtitle||'TRILHA PERSONALIZADA')}</small></div><span class="track-tag ${isCustom?'future':'beginner'}">${isCustom?'PERSONALIZADA':escapeHTML(t.tag||'INICIANTE')}</span></div>
    <p>${escapeHTML(t.description||'Crie uma sequência de tópicos e acompanhe sua evolução.')}</p>
    <div class="progress-label"><span>PROGRESSO</span><b id="${key}Percent">${percent}%</b></div><div class="progress"><span id="${key}Bar" style="width:${percent}%"></span></div>
    <div class="skill-list">${t.items.map((item,i)=>`<label><input type="checkbox" data-track="${key}" data-index="${i}"> ${escapeHTML(item)}</label>`).join("")}</div>
    ${isCustom?`<button class="remove-custom-card" data-remove-card="${key}">REMOVER TRILHA ×</button>`:""}
  </article>`;
}
function updateTrackProgress(key){
  const t=baseTracks[key]||(state.customTracks||[]).find(x=>x.id===key);if(!t)return;
  const percent=Math.round((state.tracks[key]||[]).length/t.items.length*100);
  const label=document.getElementById(key+"Percent"),bar=document.getElementById(key+"Bar");
  if(label)label.textContent=percent+"%";if(bar)bar.style.width=percent+"%";
}
function escapeHTML(value){
  return String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}
function addTrack(event){
  event.preventDefault();
  const name=document.getElementById("trackName").value.trim();
  const icon=document.getElementById("trackIcon").value.trim();
  if(!name)return;
  if(Object.values(baseTracks).some(t=>t.name.toLowerCase()===name.toLowerCase())||state.customTracks.some(t=>t.name.toLowerCase()===name.toLowerCase())){
    showToast("Essa trilha já existe.");return;
  }
  const id="custom_"+Date.now().toString(36);
  state.customTracks.push({id,name,icon:icon||name.slice(0,2).toUpperCase(),subtitle:"TRILHA PERSONALIZADA",description:"Personalize seus tópicos e acompanhe sua evolução.",tag:"PERSONALIZADA",color:"js-logo",items:["Fundamentos e conceitos básicos","Sintaxe e estrutura","Prática guiada","Exercícios e revisão","Projeto prático"]});
  state.tracks[id]=[];save();event.target.reset();renderTracks();showToast(`Trilha ${name} adicionada!`);
}
function removeTrack(id){
  const track=state.customTracks.find(t=>t.id===id);if(!track)return;
  if(!confirm(`Remover a trilha "${track.name}" e seu progresso?`))return;
  state.customTracks=state.customTracks.filter(t=>t.id!==id);delete state.tracks[id];save();renderTracks();showToast("Trilha removida.");
}
function renderWeekly(){
  const day=dayNumber(),weekIndex=Math.floor((day-1)/7),dayInWeek=((day-1)%7)+1;
  const project=weeklyProjects[weekIndex%weeklyProjects.length];
  const weekId="week"+(weekIndex+1),claimed=state.weeklyClaimed.includes(weekId);
  document.getElementById("weeklyDay").textContent=`DIA ${dayInWeek} DE 7`;
  document.getElementById("weeklyTitle").textContent=project.title;
  document.getElementById("weeklyDescription").textContent=project.desc;
  const checks=state.weeklyChecks[weekId]||[];
  ["weeklyPlan","weeklyBuild","weeklyReflect"].forEach((id,i)=>{
    const el=document.getElementById(id);el.checked=checks.includes(i);
    el.disabled=dayInWeek!==7||claimed;
    el.onchange=()=>{
      const current=state.weeklyChecks[weekId]||[];
      state.weeklyChecks[weekId]=el.checked?[...new Set([...current,i])]:current.filter(n=>n!==i);
      save();renderWeekly();
    };
  });
  const btn=document.getElementById("weeklyClaim");
  btn.disabled=dayInWeek!==7||claimed||checks.length<3;
  btn.textContent=claimed?"✓ PROJETO CONCLUÍDO":dayInWeek!==7?"LIBERA NO DIA 7":"CONCLUIR PROJETO";
  btn.onclick=()=>{
    if(dayInWeek!==7||claimed||(state.weeklyChecks[weekId]||[]).length<3)return;
    state.weeklyClaimed.push(weekId);state.coins+=100;state.xp+=100;save();render();
    showToast("Chefe derrotado! +100 moedas e +100 XP");
  };
  document.querySelector(".weekly-card").classList.toggle("weekly-locked",dayInWeek!==7&&!claimed);
  document.getElementById("weeklyReward").innerHTML=claimed?"STATUS: <b>RECOMPENSA RESGATADA</b>":"RECOMPENSA: <b>100 moedas + 100 XP</b>";
}
function renderShop(){
  document.getElementById("shopCoins").textContent=state.coins;
  document.querySelectorAll(".buy-btn").forEach(btn=>{
    const cost=Number(btn.dataset.cost);btn.disabled=state.coins<cost;
    btn.onclick=()=>{
      if(state.coins<cost){showToast("Moedas insuficientes. Complete suas missões!");return;}
      const names={coffee:"Pausa para café",game:"Sessão gamer",movie:"Noite de filme",custom:"Recompensa livre"};
      state.coins-=cost;state.inventory.push({name:names[btn.dataset.item],date:today()});save();render();
      showToast(`Resgatado: ${names[btn.dataset.item]}! Aproveite sua recompensa.`);
    };
  });
  document.getElementById("inventoryCount").textContent=`${state.inventory.length} ${state.inventory.length===1?"item":"itens"}`;
}
function render(){
  const completed=currentCompleted();
  document.getElementById("coinsTop").textContent=state.coins;
  document.getElementById("coinsStat").textContent=state.coins;
  document.getElementById("xpStat").textContent=state.xp+" XP";
  document.getElementById("levelTop").textContent=level();
  document.getElementById("levelLabel").textContent=`Nível ${level()} — ${level()===1?"Novato":level()<4?"Aprendiz":level()<8?"Dev em evolução":"Lenda do código"}`;
  document.getElementById("streak").textContent=state.streak||0;
  renderQuests();renderTracks();renderWeekly();renderShop();
}
const quotes=[
  ["VOCÊ NÃO PRECISA SABER TUDO HOJE.","Você só precisa aprender um pouco mais do que sabia ontem. Consistência é seu maior power-up."],
  ["TODO BUG É UMA PISTA.","Errar faz parte de programar. Investigue, teste e tente de novo: é assim que você evolui."],
  ["SEU FUTURO É FEITO DE PRÁTICA.","Vinte minutos de foco hoje podem abrir portas que você ainda nem imagina."],
  ["NÃO COMPARE SEU CAPÍTULO 1.","Cada pessoa tem seu ritmo. Continue construindo, uma linha de código por vez."],
  ["SALVE O PROGRESSO E CONTINUE.","Descansar também faz parte da jornada. Volte amanhã com energia para a próxima fase."]
];
document.getElementById("addTrackForm").addEventListener("submit",addTrack);
document.getElementById("motivationBtn").addEventListener("click",()=>{
  const quote=quotes[Math.floor(Math.random()*quotes.length)];
  document.querySelector(".motivation h2").textContent=quote[0];
  document.querySelector(".motivation p").textContent=quote[1];
});
render();
