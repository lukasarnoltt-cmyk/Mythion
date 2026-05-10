// --- GLOBÁLNÍ PROMĚNNÉ ---
let gameState = { currentScreen: 'menu', gameMode: 'hardcore', currentKeyLevel: 0, currentDungeon: null, lastClearedKey: 0, lastClearedDungeon: 'Žádný', clearedAtLeastOne: false };
let playerState = { gold: 150, commanderSpell: null, buffs: { enchantCount: 0, prepotCount: 0, hasFood: false, hasFlask: false, hasEnergyDrink: false, extraRerolls: 0, boeCount: 0, gemCount: 0 }, party: [], partyTraits: [] };

// --- AUDIO SYSTÉM ---
let currentBgmName = "";
let bgmAudio = null;

function playBGM(trackName) {
    if (currentBgmName === trackName) return; // Nezačínej znovu, pokud už hraje to samý
    if (bgmAudio) bgmAudio.pause();
    bgmAudio = new Audio(`sounds/bgm-${trackName}.mp3`);
    bgmAudio.loop = true;
    bgmAudio.volume = 0.3; // Ať to neřve přes Discord
    bgmAudio.play().catch(e => console.log("Prohlížeč čeká na kliknutí hráče pro spuštění hudby..."));
    currentBgmName = trackName;
}

function playSFX(trackName) {
    let sfx = new Audio(`sounds/sfx-${trackName}.mp3`);
    sfx.volume = 0.6;
    sfx.play().catch(e => {}); // Ignoruj chyby, když soubor ještě neexistuje
}

const commanderSpells = [ { id: 'reroll', name: 'Reroll', desc: 'Jednou za run můžeš rerollnout svůj DMG.' }, { id: 'pozitivita', name: 'Pozitivita', desc: 'Trvale zvýší DMG celé partě o 3%.' } ];
const dungeonsList = [ "Magister's Terrace", "Algeth'ar Academy", "Maisara Caverns", "Pit of Saron", "Nexus Point Xenas", "Seat of the Triumvirate", "Windrunner Spire", "Skyreach" ];
const dungeonSynergies = { "Magister's Terrace": { 
        'Mage': 10, 'Demon Hunter': 8, 'Warlock': 5, 'Priest': 4, 'Evoker': 3, 'Rogue': 2, 
        'Warrior': -2, 'Druid': -3, 'Death Knight': -4, 'Paladin': -5, 'Monk': -5, 'Shaman': -6 
        // Neutral: Hunter
    },
    "Algeth'ar Academy": { 
        'Evoker': 10, 'Mage': 8, 'Druid': 5, 'Shaman': 4, 'Monk': 3, 'Priest': 2, 
        'Warrior': -2, 'Rogue': -3, 'Warlock': -3, 'Hunter': -4, 'Demon Hunter': -5, 'Death Knight': -8 
        // Neutral: Paladin
    },
    "Maisara Caverns": { 
        'Shaman': 10, 'Druid': 8, 'Rogue': 5, 'Hunter': 5, 'Warrior': 3, 'Monk': 2, 
        'Paladin': -2, 'Warlock': -2, 'Demon Hunter': -3, 'Mage': -4, 'Evoker': -5, 'Priest': -6 
        // Neutral: Death Knight
    },
    "Pit of Saron": { 
        'Death Knight': 10, 'Paladin': 8, 'Priest': 5, 'Warrior': 4, 'Warlock': 3, 'Rogue': 2, 
        'Mage': -2, 'Hunter': -3, 'Monk': -4, 'Shaman': -5, 'Evoker': -6, 'Druid': -8 
        // Neutral: Demon Hunter
    },
    "Nexus Point Xenas": { 
        'Priest': 10, 'Evoker': 8, 'Mage': 5, 'Warlock': 5, 'Demon Hunter': 3, 'Shaman': 2, 
        'Hunter': -2, 'Monk': -3, 'Druid': -4, 'Death Knight': -4, 'Warrior': -5, 'Paladin': -6 
        // Neutral: Rogue
    },
    "Seat of the Triumvirate": { 
        'Paladin': 10, 'Priest': 8, 'Demon Hunter': 5, 'Mage': 4, 'Warrior': 3, 'Warlock': 2, 
        'Rogue': -2, 'Death Knight': -2, 'Druid': -3, 'Monk': -5, 'Hunter': -5, 'Shaman': -6 
        // Neutral: Evoker
    },
    "Windrunner Spire": { 
        'Hunter': 10, 'Rogue': 8, 'Death Knight': 5, 'Warlock': 4, 'Mage': 3, 'Priest': 2, 
        'Warrior': -2, 'Demon Hunter': -2, 'Shaman': -3, 'Druid': -4, 'Paladin': -5, 'Evoker': -5 
        // Neutral: Monk
    },
    "Skyreach": { 
        'Druid': 10, 'Shaman': 8, 'Monk': 6, 'Priest': 5, 'Evoker': 4, 'Hunter': 2, 
        'Demon Hunter': -2, 'Warlock': -3, 'Rogue': -4, 'Warrior': -5, 'Death Knight': -8, 'Paladin': -10 
        // Neutral: Mage
    }
 };
const pugTraitsDB = [ { id: 'normal', name: 'Normální', desc: 'Prostě hraje. Žádný stres.', type: 'neutral' }, { id: 'ragequitter', name: 'Ragequitter', desc: 'Po Wipu má 30% šanci leavnout partu.', type: 'bad' }, { id: 'afk', name: 'AFKer', desc: 'Při každém hodu má 15% šanci být AFK.', type: 'bad' }, { id: 'ninja', name: 'Ninja looter', desc: 'Po výhře má 50% šanci ukrást ti 5-15g.', type: 'bad' }, { id: 'tryhard', name: 'Tryhard', desc: 'Při hodu má 20% šanci dát +50% DMG.', type: 'good' }, { id: 'sugardaddy', name: 'Sponzor', desc: 'Po výhře má 40% šanci dát ti dýško.', type: 'good' } ];
const chatGreetings = [ "o/", "yo", "hi, pls no deplete", "gogo", "r", "buffs pls", "tank u know route?", 
    "inv sum pls", "hello guys, let's time this", "big pulls pls, i have cds", 
    "skip first trash?", "food pls", "gl hf", "i don't have flask, is it ok?",
    // --- NOVĚ PŘIDÁNO ---
    "1", "sum111", "any1 got repair bot?", "lust first pull?", 
    "hi, im drunk let's zug zug", "mdt route link pls", "first time here, hope it's easy",
    "table pls mage", "warlock closet???", "im streaming btw say hi to twitch",
    "dont pull yet, buying potions on ah", "if wipe i leave just saying",
    "can we do +2? need rio", "hi, pet pathing is weird here, sry in advance",
    "meast pls i mean feast" ];
const pugNamesPool = [ "pussyslayer69xXx", "BoostedAnimal", "CurveOrKick", "TankYouNext", "HealMePlsUwU", "ZugZugSmash", "NinjaLootZ", "AsmonBald", "FloorPOV", "OnlyPressW" ];
const pugQuotesPool = [ "Что за бизнес сука?!", "Blyat davai rush, heal sleep??", "Idi nahui noobs...", 
    "Gde damage jebat?", "healer u blind???", "bro i dashed into the pack by accident mb", 
    "kick tank hes trolling", "wait how does this boss work?", "brb mom is making pizza", 
    "why did i die? i was just standing there", "link main rio or i leave", 
    "u guys are absolute garbage", "GG go next, deplete", "gogo fast time is money", 
    "healer drink faster wtf", "pulling whole room use big cds", "im not healing u if u stand in fire", 
    "mana...", "dps do u even know what interrupt is? uwu", "me no mechanics me only smash", 
    "hero??? HEROOOO????", "why boss not dead yet?", "shroud failed sry run", 
    "are u gonna need that item?", "pls dont kick i have good st", "KEKW tank got deleted", 
    "OMEGALUL my dmg is huge", "dead game tbh", "rez pls", "wtf one shot mechanic? broken game", 
    "lag spike sry guys", "i dont have decurse on my bars", "healthstones on cd sorry", 
    "summoning portal is bugged bro just walk",
    // --- NOVĚ PŘIDÁNO ---
    "jajajaja tank paper xd", "puta madre healer", "WHO PULLED?!", 
    "ninja pull sry guys my pet is retarded", "hunter dismiss pet u idiot", 
    "BRES BRES BRES CR PLS!!!!", "ffs i clicked release...", 
    "dont release i have mass rez... nvm you are all monkeys", "why lust now u pepega?", 
    "wife aggro brb 5 min", "my cat stepped on my keyboard im so sorry", 
    "stop padding dmg and hit the priority target ffs", "cant dps im dead", 
    "affix is a healer mechanic anyway", "multi dollar company blizzard fix your trash game", 
    "Reported.", "bro my UI just bugged doing /reload", "didn't know that frontal oneshots oops",
    "kick the rogue doing 10k dps", "i lagged right into the cleave", "bruh look at meters" ];
const guildiesDB = { 
    "Exsqueez": ["WTS Aeonaxx 100k gold", "Idu se okupat", "Dám někomu follow, jdu si zakuřit."], 
    "Fajtus": ["Aeonaxx up now 200k gold", "Piče, zasranej PC mám zase 9 FPS", "Kdybych měl víc jak 15 FPS, tak ten kick stihnu do prdele."], 
    "Eljeffe": ["Píčo, dejte si hlavou o stůl!", "Já jsem healer né ranged.", "Exsqueez je nejlepší warlock kterého sem kdy viděl.", "Dejte mi leader, já ty idioty vyházím.", "Když chcípnete, tak držte aspoň hubu!"], 
    "Suzu": ["Co se stalo, já si to vůbec nepamatuju.", "Vykašlete se na DPS a začněte kurva kickovat!", "Kluci, já jsem asi usnul, kde jsme?", "Kluci, já si musím si ubalit, jinak tohle nedám.", "Kluci já bych si šel káknout."],
    "Faceless": ["Prečo ten tank pulluje take omrvinky", "Intrestiana pint?", "Dávaj Bloodlust na trash, nech to odsýpa!", "Potiahni celú túto chodbu, inak tu zaspím od nudy.", "Bože, čo sa tu jebkáme po jednom mobovi, naber to všetko doriti!"], 
    "Arny": ["Tý, asi si založím jinou postavu", "Kluci, jakej je teď meta class? Že bych to expnul.", "Na tomhle charu mě to už nebaví, jdu mainit huntera.", "Zítra to zkusím za maga, prý teď dávaj hrozný bomby."], 
    "Mimi": ["Héy borci, ale snažte se.", "Kluci prosím, aspoň jeden interrupt by se fakt hodil.", "Kluci nehádejte se furt, ten klíč se dá ještě stihnout.", "Já vím, že to je těžký, ale aspoň jsme se něco naučili, ne?"], 
    "Weirdosek": ["Hej dobrej dmg mám né?", "Natož že hraju 3 dny tak jsem dobrej né?", "Platíte všichni daně že?", "Co znamená ten fialovej kruh pod mojí postavou?", "Na to, že to hraju poprvé, tak vás tady neskutečně carryuju."], 
    "Matess": ["Já to jebem chalaňi", "Do piče, mňa to nebaví, ja idem k susedovi na pivo.", "Čo ti jebe,ja si idem naliať poldeci."] 
};

function getRandomTrait() { if(Math.random() < 0.4) return pugTraitsDB.find(t => t.id === 'normal'); let specials = pugTraitsDB.filter(t => t.id !== 'normal'); return specials[Math.floor(Math.random() * specials.length)]; }
function getBaseClass(charString) { const classes = ['Mage', 'Warlock', 'Demon Hunter', 'Paladin', 'Warrior', 'Evoker', 'Druid', 'Rogue', 'Death Knight', 'Shaman', 'Hunter', 'Priest', 'Monk']; for (let c of classes) { if (charString.includes(c)) return c; } return null; }

function getClassIcon(className) {
    if (!className) return '';
    let safeName = className.toLowerCase();
    if (safeName === 'death knight') safeName = 'dk';
    if (safeName === 'demon hunter') safeName = 'dh';
    return `img/icon-${safeName}.png`;
}

const shopItems = [
    { id: 'enchant', name: 'Enchant (+1)', basePrice: 80, desc: 'Zvýší osobní DMG. Lze stackovat až 8x.' }, 
    { id: 'prepot', name: 'Prepotka', basePrice: 30, desc: '+10% DMG na jeden souboj pro tebe. (Max 3 kusy)' },
    { id: 'food', name: 'Jídlo', basePrice: 20, desc: '+5% DMG pro tebe do konce dungeonu.' },
    { id: 'flask', name: 'Flaška Síly', basePrice: 150, desc: '+20% DMG pro tebe do konce dungeonu.' },
    { id: 'energydrink', name: 'Energeťák pro Partu', basePrice: 200, desc: '+10% DMG pro všechny PUGy na run.' },
    { id: 'reroll_token', name: 'Falešná kostka', basePrice: 120, desc: 'Získáš 1x možnost Rerollnout svůj DMG.' },
    { id: 'boe', name: 'BOE Item', basePrice: 500, desc: '+20% tvůj DMG nastálo. Kupuj dokud máš prachy.' }, 
    { id: 'gem', name: 'Epický Gem', basePrice: 100, desc: '+6% tvůj DMG. (Max 2 kusy)' } 
];
let currentShopPrices = {};

function setBackground(classType) {
    document.body.className = ''; 
    if (classType === 'dungeon' && gameState.currentDungeon) {
        const safeDungeonName = gameState.currentDungeon.toLowerCase().replace(/'/g, '').replace(/\s+/g, '-');
        document.body.classList.add(`bg-combat-${safeDungeonName}`);
    } else {
        document.body.classList.add(`bg-${classType}`);
    }
}

function initGame() { setBackground('menu'); showMainMenu(); }

function showMainMenu() {
    gameState.currentScreen = 'menu';
    const app = document.getElementById('game-app');
    app.innerHTML = `
        <div class="menu-container">
            <h1>WoW M+ PUG Simulator</h1>
            <p class="subtitle">Deplete = Konec hry</p>
            <div class="mode-selection">
                <h2>Vyber mód:</h2>
                <button disabled>Standard (Zamčeno)</button>
                <button class="btn-active">Hardcore (Selected)</button>
            </div>
            <div class="spell-selection">
                <h2>Zvol si Commander Spell:</h2>
                <div id="spell-buttons"></div>
            </div>
            <div class="start-game" style="margin-top: 15px;">
                <button id="btn-start" disabled onclick="startGame()">START HRY</button>
                <button onclick="playSFX('click'); showTutorial()" style="border-color: #00ccff; color: #00ccff; margin-left: 10px;">Jak hrát?</button>
            </div>
        </div>
    `;
    const spellButtonsDiv = document.getElementById('spell-buttons');
    commanderSpells.forEach(spell => {
        const btn = document.createElement('button'); 
        btn.innerHTML = `<img src="img/spell-${spell.id}.png" style="width:24px; height:24px; vertical-align:middle; margin-right:5px; border-radius:4px;" onerror="this.style.display='none'"> ${spell.name}`;
        btn.title = spell.desc;
        btn.onclick = () => { playSFX('click'); selectSpell(spell.id, btn); }; 
        spellButtonsDiv.appendChild(btn);
    });
}
function showTutorial() {
    playSFX('click');
    gameState.currentScreen = 'tutorial';
    const app = document.getElementById('game-app');
    
    app.innerHTML = `
        <div class="menu-container" style="text-align: left; max-width: 650px;">
            <h1 style="text-align: center; color: #ffaa00;">Rychlokurz přežití v LFG</h1>
            
            <p style="color: #ddd;"><b> 1. Hub a Aukce:</b><br>
            Tady seš v bezpečí. Nakupuj za goldy buffy (jídlo, flašky, enchanty). Goldy získáváš po dokončení dungeonu a množství, které dostaneš závisí na ušetřeném čase.</p>
            
            <p style="color: #ddd;"><b> 2. Draft Party:</b><br>
            Vybíráš si PUGy. Bacha, každý má skrytou povahu (třeba zloděj, co ti ukradne goldy, nebo nervák, co může po wipu leavnout). Skládej partu tak, ať mají synergie s dungeonem a potřebné spelly tak, aby se neduplikovali!</p>
            
            <p style="color: #ddd;"><b> 3. Combat:</b><br>
            Klikáš na karty a házíš DMG. Nezapomeň mačkat spelly svý party (Bloodlust, B-Rez atd.). Pokud dáte menší DMG než má boss encounter HP, je WIPE a ztrácíte drahocenný čas.</p>
            
            <p style="color: #ddd;"><b> 4. Cíl hry:</b><br>
            Pročisti všech 6 encounteru, než ti vyprší 30 minut. Dojde čas = <b>DEPLETE</b> a hra končí. Dokonči co největší možný klíč a v případě guildovního eventu můžeš vyhrát goldy!</p>


            
            <div style="text-align: center; margin-top: 25px;">
                <button onclick="playSFX('click'); showMainMenu()" style="border-color: #00ff00; color: #00ff00;">Jasný, umím číst. Zpět do Menu!</button>
            </div>
        </div>
    `;
}

function selectSpell(spellId, clickedButton) {
    playerState.commanderSpell = spellId;
    const allSpellBtns = document.getElementById('spell-buttons').getElementsByTagName('button');
    for(let b of allSpellBtns) { b.classList.remove('selected'); }
    clickedButton.classList.add('selected'); document.getElementById('btn-start').disabled = false;
}

function startGame() {
    playSFX('click');
    const randomIndex = Math.floor(Math.random() * dungeonsList.length);
    gameState.currentDungeon = dungeonsList[randomIndex];
    gameState.currentKeyLevel = 0;
    shopItems.forEach(item => { currentShopPrices[item.id] = Math.ceil(item.basePrice * (0.7 + (Math.random() * 0.8))); });
    showHub();
}

function showHub() {
    playBGM('hub');
    gameState.currentScreen = 'hub'; setBackground('hub'); 
    const app = document.getElementById('game-app');
    app.innerHTML = `
        <div class="menu-container">
            <h1>Selvermoon</h1>
            <div class="hub-info">
                <p>Goldy: <span class="gold-text">${playerState.gold}g</span></p>
                <p>Klíč: <br><span class="dungeon-text">${gameState.currentDungeon} (+${gameState.currentKeyLevel})</span></p>
            </div>
            <button onclick="playSFX('click'); showAuctionHouse()">Aukce</button>
            <button onclick="playSFX('click'); startDraft()" style="border-color: #ff0000; color: #ff5555;">Jít LFG</button>
        </div>
    `;
}

function showAuctionHouse() { 
    gameState.currentScreen = 'auction'; 
    setBackground('auction'); 
    const app = document.getElementById('game-app');
    let html = `
        <div class="menu-container">
            <h1>Aukční dům</h1>
            <p>Goldy: <span class="gold-text" id="ah-gold-display">${playerState.gold}g</span></p>
            <div class="ah-grid">
    `;
    shopItems.forEach(item => {
        let activePrice = currentShopPrices[item.id]; 
        let priceColor = activePrice <= item.basePrice ? "#00ff00" : "#ff4444";
        html += `
            <div class="ah-item" style="display: flex; align-items: center; text-align: left;">
                <img src="img/item-${item.id}.png" style="width:48px; height:48px; border:2px solid #555; border-radius:6px; margin-right:15px;" onerror="this.style.display='none'">
                <div class="ah-item-info" style="flex-grow: 1;">
                    <h3 style="margin:0 0 5px 0;">${item.name}</h3>
                    <p style="margin:0; font-size:0.9em; color:#aaa;">${item.desc}</p>
                </div>
                <button onclick="buyItem('${item.id}', ${activePrice})">Koupit (<span style="color:${priceColor};">${activePrice}g</span>)</button>
            </div>
        `;
    });
    html += `</div><button onclick="playSFX('click'); showHub()">Zpět</button></div>`; app.innerHTML = html;
}

function buyItem(itemId, price) {
    if (playerState.gold >= price) {
        playSFX('gold');
        if (itemId === 'enchant') { if (playerState.buffs.enchantCount >= 8) { alert("Max! (8 enchantů)"); return; } playerState.buffs.enchantCount++; } 
        else if (itemId === 'prepot') { if (playerState.buffs.prepotCount >= 3) { alert("Max! (3 prepotky)"); return; } playerState.buffs.prepotCount++; } 
        else if (itemId === 'food') { playerState.buffs.hasFood = true; } 
        else if (itemId === 'flask') { playerState.buffs.hasFlask = true; } 
        else if (itemId === 'energydrink') { playerState.buffs.hasEnergyDrink = true; } 
        else if (itemId === 'reroll_token') { playerState.buffs.extraRerolls++; } 
        else if (itemId === 'boe') { playerState.buffs.boeCount++; } 
        else if (itemId === 'gem') { if (playerState.buffs.gemCount >= 2) { alert("Max! (2 gemy)"); return; } playerState.buffs.gemCount++; }
        playerState.gold -= price; document.getElementById('ah-gold-display').innerText = `${playerState.gold}g`;
    } else { alert("Goldů je málo! Jdi farmit."); }
}

const classPools = { 
    tank: ['Warrior Protection', 'Monk Brewmaster', 'Death Knight Blood', 'Guardian Druid', 'Paladin Protection', 'Demon Hunter Vengeance'], 
    healer: ['Druid Healer', 'Shaman Healer', 'Monk Healer', 'Paladin Healer', 'Evoker Healer', 'Priest Healer'], 
    dps: ['Death Knight', 'Demon Hunter', 'Warlock', 'Evoker', 'Warrior', 'Rogue', 'Druid', 'Paladin', 'Shaman', 'Mage', 'Hunter', 'Monk', 'Priest'] 
};
let draftPhase = 0; let currentDraftOptions = [];

function startDraft() { playerState.party = []; playerState.partyTraits = []; draftPhase = 0; gameState.currentScreen = 'draft'; setBackground('draft'); nextDraftStep(); }

function nextDraftStep() {
    const app = document.getElementById('game-app');
    if (draftPhase === 4) { finishDraft(); return; }
    
    let activeSpells = playerState.party.map(member => { 
        let bClass = getBaseClass(member); 
        if(bClass && classSpellsMap[bClass]) return classSpellsMap[bClass].name; 
        return null; 
    }).filter(s => s !== null);
    
    let pool = []; let roleName = "";
    if (draftPhase === 0) { pool = classPools.tank; roleName = "Tank"; } 
    else if (draftPhase === 1) { pool = classPools.healer; roleName = "Healer"; } 
    else { pool = classPools.dps; roleName = "DPS"; }
    
    pool = pool.filter(charName => { 
        let bClass = getBaseClass(charName); 
        let hasClass = playerState.party.some(m => m.includes(bClass)); 
        if(hasClass) return false; 
        if(bClass && classSpellsMap[bClass]) { if(activeSpells.includes(classSpellsMap[bClass].name)) return false; } 
        return true; 
    });
    
    if(pool.length < 2) { pool = draftPhase === 0 ? classPools.tank : (draftPhase === 1 ? classPools.healer : classPools.dps); }
    let shuffled = [...pool].sort(() => 0.5 - Math.random()); currentDraftOptions = [shuffled[0], shuffled[1]];
    let currentDungeonData = dungeonSynergies[gameState.currentDungeon] || {};
    
    let class1 = getBaseClass(currentDraftOptions[0]); 
    let syn1 = currentDungeonData[class1] || 0; 
    let synText1 = syn1 > 0 ? `<p class="synergy-buff">+${syn1}% DMG</p>` : (syn1 < 0 ? `<p class="synergy-debuff">${syn1}% DMG</p>` : `<p style="color:#888; font-size: 0.8em;">--</p>`); 
    let spell1 = classSpellsMap[class1]; 
    let spellText1 = spell1 ? `<p style="color:#00ccff; font-weight:bold; cursor:help;" title="${spell1.desc}">✨ Spell: ${spell1.name}</p>` : ''; 
    let trait1 = getRandomTrait(); 
    let traitText1 = `<p style="color:#888; font-weight:bold; cursor:help;" title="Zjistíš po startu!">🎭 Povaha: ???</p>`;
    let iconHtml1 = `<img src="${getClassIcon(class1)}" style="width:50px; height:50px; border-radius:50%; border: 2px solid #555; margin-bottom: 5px;" onerror="this.style.display='none'">`;

    let class2 = getBaseClass(currentDraftOptions[1]); 
    let syn2 = currentDungeonData[class2] || 0; 
    let synText2 = syn2 > 0 ? `<p class="synergy-buff">+${syn2}% DMG</p>` : (syn2 < 0 ? `<p class="synergy-debuff">${syn2}% DMG</p>` : `<p style="color:#888; font-size: 0.8em;">--</p>`); 
    let spell2 = classSpellsMap[class2]; 
    let spellText2 = spell2 ? `<p style="color:#00ccff; font-weight:bold; cursor:help;" title="${spell2.desc}">✨ Spell: ${spell2.name}</p>` : ''; 
    let trait2 = getRandomTrait(); 
    let traitText2 = `<p style="color:#888; font-weight:bold; cursor:help;" title="Zjistíš po startu!">🎭 Povaha: ???</p>`;
    let iconHtml2 = `<img src="${getClassIcon(class2)}" style="width:50px; height:50px; border-radius:50%; border: 2px solid #555; margin-bottom: 5px;" onerror="this.style.display='none'">`;

    app.innerHTML = `
        <div class="menu-container">
            <h1>Skládání Party</h1>
            <p class="subtitle">Dungeon: <span style="color:#b044ff;">${gameState.currentDungeon}</span></p>
            <h2>Role: <span style="color:#00ccff">${roleName}</span></h2>
            <div class="draft-grid">
                <div class="draft-card" onclick="pickCharacter('${currentDraftOptions[0]}', '${roleName}', '${trait1.id}')">
                    ${iconHtml1}
                    <h3>${currentDraftOptions[0]}</h3>
                    ${synText1}${spellText1}${traitText1}
                </div>
                <div class="draft-card" onclick="pickCharacter('${currentDraftOptions[1]}', '${roleName}', '${trait2.id}')">
                    ${iconHtml2}
                    <h3>${currentDraftOptions[1]}</h3>
                    ${synText2}${spellText2}${traitText2}
                </div>
            </div>
            <p style="color: #888; margin-top: 15px;">Tvoje parta: ${playerState.party.join(', ') || 'Prázdná.'}</p>
        </div>
    `;
}

function pickCharacter(charName, role, traitId) { playSFX('click'); playerState.party.push(`${charName} (${role})`); playerState.partyTraits.push(traitId); draftPhase++; nextDraftStep(); }

function finishDraft() {
    const app = document.getElementById('game-app');
    let partyHtml = playerState.party.map((member, idx) => { return `<li>${member} <span style="color:#888; font-size:0.8em;">[???]</span></li>`; }).join('');
    app.innerHTML = `
        <div class="menu-container">
            <h1>Parta je ready!</h1>
            <ul style="list-style: none; padding: 0; color: #ffaa00; font-size: 1.2em; text-align: left; max-width: 400px; margin: 0 auto;">
                ${partyHtml}<li>Ty (3. DPSko)</li>
            </ul>
            <br><br>
            <button id="btn-start" style="border-color: #ff0000; color: #ff5555;" onclick="startCombat()">Vstoupit do Dungeonu</button>
        </div>
    `;
}

// --- COMBAT LOGIKA ---
let combatState = {
    timeRemaining: 1800, currentEncounterIndex: 0,
    encounters: [ { type: 'Trash', baseHp: 330, baseTimeCost: 180 }, { type: 'Trash', baseHp: 330, baseTimeCost: 180 }, { type: 'Boss', baseHp: 500, baseTimeCost: 300 }, { type: 'Trash', baseHp: 330, baseTimeCost: 180 }, { type: 'Trash', baseHp: 330, baseTimeCost: 180 }, { type: 'Boss', baseHp: 500, baseTimeCost: 300 } ],
    cardsRevealed: 0, currentRoundDmg: [], prepotCd: 0, prepotActive: false, rerollsLeft: 0,
    partyIlvls: [], partySpells: [], bloodlustActive: false, piActive: false, massDispelActive: false, cheatDeathTarget: null, bigPullActive: false, bRezBonus: 0, pugTraits: [], partyNames: [], chatHistory: []
};

const damageRanges = { 'Tank': { min: 70, max: 100 }, 'Healer': { min: 20, max: 60 }, 'DPS': { min: 90, max: 160 }, 'Player': { min: 110, max: 200 } };
const classSpellsMap = { Mage: { name: 'Bloodlust', cdType: 'key', desc: '+30% DMG (1x)' }, Shaman: { name: 'Bloodlust', cdType: 'key', desc: '+30% DMG (1x)' }, Druid: { name: 'B-Rez', cdType: 'key', desc: '+100 DMG wipe (1x)' }, Warlock: { name: 'B-Rez', cdType: 'key', desc: '+100 DMG wipe (1x)' }, Priest: { name: 'PI', cdType: 'encounter', maxCd: 3, desc: 'Tobě max DMG (CD: 3)' }, Paladin: { name: 'PI', cdType: 'encounter', maxCd: 3, desc: 'Tobě max DMG (CD: 3)' }, Monk: { name: 'MD', cdType: 'encounter', maxCd: 2, desc: 'Smaže debuff (CD: 2)' }, Evoker: { name: 'MD', cdType: 'encounter', maxCd: 2, desc: 'Smaže debuff (CD: 2)' }, Rogue: { name: 'Cheat Death', cdType: 'encounter', maxCd: 2, desc: 'Hodí 2x DMG (CD: 2)' }, Hunter: { name: 'Cheat Death', cdType: 'encounter', maxCd: 2, desc: 'Hodí 2x DMG (CD: 2)' }, Warrior: { name: 'Big Pull', cdType: 'encounter', maxCd: 3, desc: 'HP -20%, ruší overkill (CD: 3)' }, 'Demon Hunter': { name: 'Big Pull', cdType: 'encounter', maxCd: 3, desc: 'HP -20%, ruší overkill (CD: 3)' }, 'Death Knight': { name: 'Big Pull', cdType: 'encounter', maxCd: 3, desc: 'HP -20%, ruší overkill (CD: 3)' } };

function addChatMessage(name, text, color) { 
    combatState.chatHistory.push(`<div class="chat-message"><span style="color:${color}; font-weight:bold;">[${name}]:</span> ${text}</div>`); 
    if(combatState.chatHistory.length > 50) combatState.chatHistory.shift(); 
    if(gameState.currentScreen === 'combat') { 
        const chatBox = document.getElementById('chat-messages'); 
        if(chatBox) { chatBox.innerHTML = combatState.chatHistory.join(''); const chatContainer = document.querySelector('.party-chat'); if(chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight; } 
    } 
}

function triggerGreetings() { 
    let delay = 1500; 
    for(let i=0; i<4; i++) { 
        setTimeout(() => { 
            let name = combatState.partyNames[i]; 
            let msg = chatGreetings[Math.floor(Math.random() * chatGreetings.length)]; 
            let isGuildie = guildiesDB[name] !== undefined; 
            let color = isGuildie ? "#ff44ff" : "#ffaa00"; 
            addChatMessage(name, msg, color); 
        }, delay); 
        delay += 1000 + (Math.random() * 1000); 
    } 
}

function triggerMidRunChat() { 
    let delay = 1000; 
    for(let i=0; i<4; i++) { 
        let traitInfo = combatState.pugTraits[i]; 
        if(traitInfo && !traitInfo.active) continue; 
        if (Math.random() < 0.60) { 
            setTimeout(() => { 
                let name = combatState.partyNames[i]; let msg = ""; let isGuildie = guildiesDB[name] !== undefined; 
                if (isGuildie) msg = guildiesDB[name][Math.floor(Math.random() * guildiesDB[name].length)]; 
                else msg = pugQuotesPool[Math.floor(Math.random() * pugQuotesPool.length)]; 
                let color = isGuildie ? "#ff44ff" : "#ffaa00"; addChatMessage(name, msg, color); 
            }, delay); 
            delay += 1000 + (Math.random() * 1000); 
        } 
    } 
}

function startCombat() {
    playBGM('combat');
    gameState.currentScreen = 'combat'; setBackground('dungeon'); 
    if (playerState.party.length === 4) { playerState.party.push("Ty (Hráč)"); }
    combatState.timeRemaining = 1800; combatState.currentEncounterIndex = 0; combatState.cardsRevealed = 0; combatState.currentRoundDmg = []; combatState.prepotCd = 0; combatState.prepotActive = false; combatState.rerollsLeft = (playerState.commanderSpell === 'reroll' ? 1 : 0) + playerState.buffs.extraRerolls; combatState.bloodlustActive = false; combatState.piActive = false; combatState.massDispelActive = false; combatState.cheatDeathTarget = null; combatState.bigPullActive = false; combatState.bRezBonus = 0; combatState.partyIlvls = []; combatState.partySpells = []; combatState.pugTraits = [];
    let allAvailableNames = [...pugNamesPool, ...Object.keys(guildiesDB)]; combatState.partyNames = [];
    for(let i=0; i<4; i++) { let pickedIndex = Math.floor(Math.random() * allAvailableNames.length); combatState.partyNames.push(allAvailableNames.splice(pickedIndex, 1)[0]); }
    combatState.partyNames.push("Ty"); combatState.chatHistory = []; addChatMessage("System", `Klíč: ${gameState.currentDungeon} (+${gameState.currentKeyLevel}).`, "#ffff00"); addChatMessage("Ty", " pls neposerte to...", "#00ccff");
    let minIlvl = Math.min(270, 220 + (gameState.currentKeyLevel * 3)); let maxIlvl = 289;
    for (let i = 0; i < 5; i++) { 
        if (i === 4) { combatState.partyIlvls[i] = null; combatState.pugTraits[i] = { id: 'normal', active: true }; } 
        else { 
            combatState.partyIlvls[i] = Math.floor(Math.random() * (maxIlvl - minIlvl + 1)) + minIlvl; 
            combatState.pugTraits[i] = { id: playerState.partyTraits[i] || 'normal', active: true }; 
            let bClass = getBaseClass(playerState.party[i]); 
            if (bClass && classSpellsMap[bClass]) { 
                let spellToGive = classSpellsMap[bClass]; 
                let alreadyHasSpell = combatState.partySpells.some(ps => ps.spellData.name === spellToGive.name); 
                if (!alreadyHasSpell) { combatState.partySpells.push({ pugIndex: i, className: bClass, spellData: spellToGive, usedThisKey: false, currentCd: 0 }); }
            } 
        } 
    }
    renderCombatScreen(); triggerGreetings();
}

function renderCombatScreen() {
    const app = document.getElementById('game-app');
    let encounter = combatState.encounters[combatState.currentEncounterIndex];
    let scaledHp = Math.ceil(encounter.baseHp * (1 + (gameState.currentKeyLevel * 0.05)));
    if (combatState.bigPullActive) scaledHp = Math.floor(scaledHp * 0.8);
    
    let mins = Math.floor(combatState.timeRemaining / 60); let secs = combatState.timeRemaining % 60; let timeString = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    let foodText = playerState.buffs.hasFood ? `<img src="img/item-food.png" style="width:20px; vertical-align:middle;" onerror="this.style.display='none'"> 🍲 Jídlo` : ""; 
    let flaskText = playerState.buffs.hasFlask ? `<img src="img/item-flask.png" style="width:20px; vertical-align:middle; margin-left:10px;" onerror="this.style.display='none'"> 🧪 Flaška` : ""; 
    let energyText = playerState.buffs.hasEnergyDrink ? `<img src="img/item-energydrink.png" style="width:20px; vertical-align:middle; margin-left:10px;" onerror="this.style.display='none'"> ⚡ Partě` : "";
    let totalDmgSoFar = combatState.currentRoundDmg.reduce((a, b) => (a || 0) + (b || 0), 0) + combatState.bRezBonus;
    let hpPercent = Math.min(100, Math.floor((totalDmgSoFar / scaledHp) * 100));
    
    // --- CHYTRÁ LOGIKA PRO ROZDĚLENÍ BOSSŮ 1 A 2 ---
    const safeDungeonName = gameState.currentDungeon.toLowerCase().replace(/'/g, '').replace(/\s+/g, '-');
    let imgType = encounter.type.toLowerCase();
    if (encounter.type === 'Boss') {
        // Pokud je to 3. encounter (index 2), je to boss1, pokud 6. (index 5), je to boss2
        imgType = combatState.currentEncounterIndex < 3 ? 'boss1' : 'boss2';
    }
    const imgFileName = `${imgType}-${safeDungeonName}.png`;
    
    let encounterImgHtml = `<img src="img/${imgFileName}" alt="${encounter.type}" onerror="this.parentElement.innerHTML='<div style=\\'color:#ffaa00; font-family:Cinzel; font-size:1.5em;\\'>⚠️ Chybí Art! ⚠️</div><div style=\\'color:#aaa; font-family:Roboto; font-size:1.2em; margin-top:10px;\\'>Vygeneruj a vlož do složky img/:</div><div style=\\'color:#fff; font-weight:bold; font-size:1.4em; margin-top:5px;\\'>${imgFileName}</div>'">`;
    
    let html = `
        <div class="combat-wrapper">
            <div class="combat-layout">
                <div class="combat-left">
                    <div class="combat-header">
                        <div class="encounter-info">Zápas #${combatState.currentEncounterIndex + 1}/6: <span style="color:#ffaa00;">${encounter.type}</span></div>
                        <div class="timer">${timeString}</div>
                    </div>
                    <div class="action-bar">
                        <div style="color: #00ccff; padding-top: 5px;">Ty:</div>`;
                        
    if (playerState.commanderSpell === 'reroll' || playerState.buffs.extraRerolls > 0) { 
        html += `<button class="spell-btn" ${combatState.rerollsLeft <= 0 ? "disabled" : ""} onclick="useReroll()"><img src="img/spell-reroll.png" style="width:20px; vertical-align:middle;" onerror="this.style.display='none'"> Reroll (${combatState.rerollsLeft})</button>`; 
    }
    if (playerState.buffs.prepotCount > 0 || combatState.prepotActive || combatState.prepotCd > 0) { 
        let isDisabled = (combatState.prepotCd > 0 || combatState.prepotActive || playerState.buffs.prepotCount <= 0); 
        html += `<button class="item-btn" ${isDisabled ? "disabled" : ""} onclick="usePrepot()"><img src="img/item-prepot.png" style="width:20px; vertical-align:middle;" onerror="this.style.display='none'"> ${combatState.prepotActive ? "AKTIVNÍ!" : `Prepot (${playerState.buffs.prepotCount})`}</button>`; 
    }
    
    html += `<div style="margin-left:15px; padding-top:8px;">${foodText}${flaskText}${energyText}</div>
        </div>
        <div class="action-bar">
            <div style="color: #ffaa00; padding-top: 5px;">Parta:</div>`;
            
    combatState.partySpells.forEach((ps, idx) => { 
        let spellSafeName = ps.spellData.name.toLowerCase().replace(/[^a-z]/g, ''); // Např. 'B-Rez' -> 'brez'
        let btnText = `<img src="img/spell-${spellSafeName}.png" style="width:20px; height:20px; vertical-align:middle;" onerror="this.style.display='none'"> ${ps.spellData.name} (${ps.className})`; 
        let disabled = (ps.spellData.cdType === 'key' && ps.usedThisKey) || (ps.spellData.cdType === 'encounter' && ps.currentCd > 0) || (ps.spellData.name === 'Bloodlust' && combatState.bloodlustActive) || (ps.spellData.name === 'Mass Dispel' && combatState.massDispelActive) || (ps.spellData.name === 'PI' && combatState.piActive) || (ps.spellData.name === 'Big Pull' && combatState.bigPullActive) || (ps.spellData.name === 'B-Rez'); 
        if (ps.spellData.cdType === 'encounter' && ps.currentCd > 0) btnText += ` [CD: ${ps.currentCd}]`; 
        html += `<button class="spell-btn" style="background-color:rgba(136,0,0,0.8); cursor:help;" id="btn-party-${idx}" ${disabled ? "disabled" : ""} title="${ps.spellData.desc}" onclick="usePartySpell(${idx})">${btnText}</button>`; 
    });
    
    html += `</div>
            <div style="text-align: center; margin: 20px 0;">
                <h3 style="color: #ffaa00; margin-bottom: 5px; font-family: 'Cinzel', serif;">Progress Encounteru</h3>
                <div class="hp-bar-container">
                    <div class="hp-bar-fill" style="width: ${hpPercent}%;"></div>
                    <div class="hp-bar-text"><span id="total-dmg-display">${totalDmgSoFar}</span> / ${scaledHp} (${hpPercent}%)</div>
                </div>
            </div>
            <div class="party-grid">`;
            
    playerState.party.forEach((member, index) => { 
        let rarityStyle = ""; let pNameHtml = `<div style="color:#fff; font-weight:bold;">${combatState.partyNames[index]}</div>`; 
        
        let bClass = index === 4 ? null : getBaseClass(member);
        let iconHtml = bClass ? `<img src="${getClassIcon(bClass)}" style="width:40px; height:40px; border-radius:5px; margin-top:5px; border:1px solid #888;" onerror="this.style.display='none'">` : '';
        
        if (index !== 4) { 
            let ilvl = combatState.partyIlvls[index]; 
            if (ilvl >= 280) rarityStyle = "border-color: #ff8000; box-shadow: 0 0 15px rgba(255,128,0,0.4);"; 
            else if (ilvl >= 260) rarityStyle = "border-color: #a335ee; box-shadow: 0 0 15px rgba(163,53,238,0.4);"; 
            else if (ilvl >= 240) rarityStyle = "border-color: #0070dd; box-shadow: 0 0 10px rgba(0,112,221,0.4);"; 
            else rarityStyle = "border-color: #1eff00;"; 
            
            let traitHtml = ""; let tObj = pugTraitsDB.find(tr => tr.id === combatState.pugTraits[index]?.id); 
            if (tObj) { let deco = !combatState.pugTraits[index].active ? "text-decoration: line-through; color: #555;" : ""; let col = tObj.type === 'good' ? '#00ff00' : (tObj.type === 'bad' ? '#ff4444' : '#888'); traitHtml = `<div style="color:${col}; font-size:0.8em; cursor:help; ${deco}" title="${tObj.desc}">[${tObj.name}]</div>`; }
            let isHidden = combatState.currentRoundDmg[index] === undefined;
            html += `<div class="combat-card ${isHidden ? 'hidden' : ''}" style="${!isHidden ? rarityStyle : ''}" onclick="revealCard(${index}, ${scaledHp})">
                ${pNameHtml}
                ${iconHtml}
                <div class="card-name">${member}</div><div style="color:#00ccff; font-weight:bold;">ilvl: ${ilvl}</div>${traitHtml}
                <div class="dmg-number" style="display:${!isHidden ? 'block' : 'none'};">${combatState.currentRoundDmg[index]}</div>
                <p style="color: #fff; font-size: 1.5em; margin: 0; display:${isHidden ? 'block' : 'none'};">?</p>
            </div>`; 
        } else { 
            let isHidden = combatState.currentRoundDmg[index] === undefined;
            html += `<div class="combat-card ${isHidden ? 'hidden' : ''}" onclick="revealCard(${index}, ${scaledHp})">
                ${pNameHtml}<div class="card-name">Ty</div>
                <div class="dmg-number" style="display:${!isHidden ? 'block' : 'none'};">${combatState.currentRoundDmg[index]}</div>
                <p style="color: #fff; font-size: 1.5em; margin: 0; display:${isHidden ? 'block' : 'none'};">?</p>
            </div>`; 
        } 
    });
    
    let resolveBtnHtml = `<button disabled style="background-color: rgba(85,85,85,0.8);">Vyhodnotit Encounter</button>`;
    if (combatState.cardsRevealed === 5) {
        if (totalDmgSoFar >= scaledHp) {
            resolveBtnHtml = `<button style="background-color: rgba(0,136,0,0.8); border-color: #00ff00; box-shadow: 0 0 15px rgba(0,255,0,0.5);" onclick="resolveEncounter(${totalDmgSoFar}, ${scaledHp})">Zabit! (Pokračovat)</button>`;
        } else {
            resolveBtnHtml = `<button style="background-color: rgba(204,0,0,0.8); border-color: #ff0000; box-shadow: 0 0 15px rgba(255,0,0,0.5);" onclick="resolveEncounter(${totalDmgSoFar}, ${scaledHp})">WIPE! (Vyhodnotit fail)</button>`;
        }
    }

    html += `</div>
            <div style="margin-top: 30px;">
                ${resolveBtnHtml}
            </div>
        </div>
        <div class="combat-right">
            <div class="encounter-image-placeholder">${encounterImgHtml}</div>
            <div class="party-chat">
                <h3>[Party Chat]</h3>
                <div id="chat-messages">${combatState.chatHistory.join('')}</div>
            </div>
        </div>
    </div></div>`;
    
    app.innerHTML = html; 
    
    if (combatState.cardsRevealed === 5 && totalDmgSoFar < scaledHp) {
        combatState.partySpells.forEach((ps, idx) => {
            if (ps.spellData.name === 'B-Rez' && !ps.usedThisKey) {
                let btn = document.getElementById(`btn-party-${idx}`);
                if (btn) btn.disabled = false;
            }
        });
    }
}

function usePartySpell(idx) { 
    playSFX('click');
    let ps = combatState.partySpells[idx]; 
    if (ps.spellData.cdType === 'key') ps.usedThisKey = true; 
    if (ps.spellData.cdType === 'encounter') ps.currentCd = ps.spellData.maxCd; 
    if (ps.spellData.name === 'Bloodlust') combatState.bloodlustActive = true; 
    if (ps.spellData.name === 'PI') combatState.piActive = true; 
    if (ps.spellData.name === 'MD') combatState.massDispelActive = true; 
    if (ps.spellData.name === 'Big Pull') combatState.bigPullActive = true; 
    if (ps.spellData.name === 'Cheat Death') combatState.cheatDeathTarget = ps.pugIndex; 
    if (ps.spellData.name === 'B-Rez') combatState.bRezBonus += 100; 
    renderCombatScreen(); 
}

function usePrepot() { 
    playSFX('click');
    if (combatState.prepotCd > 0 || combatState.prepotActive || playerState.buffs.prepotCount <= 0) return; 
    playerState.buffs.prepotCount--; combatState.prepotActive = true; combatState.prepotCd = 3; 
    renderCombatScreen(); 
}

function useReroll() { 
    if (combatState.currentRoundDmg[4] === undefined) { alert("Odkryj svoji kartu!"); return; } 
    if (combatState.rerollsLeft <= 0) return; 
    playSFX('click');
    combatState.rerollsLeft--; 
    let result = calculateDmg('Player', damageRanges['Player'], null, null, 4); 
    combatState.currentRoundDmg[4] = result.finalDmg; 
    renderCombatScreen(); 
}

function calculateDmg(role, baseRange, pugIlvl, charName, cardIndex) { 
    let traitInfo = combatState.pugTraits[cardIndex]; 
    if (traitInfo && !traitInfo.active) return { finalDmg: 0 }; 
    if (traitInfo && traitInfo.id === 'afk' && Math.random() < 0.15) { 
        addChatMessage("System", `${combatState.partyNames[cardIndex]} šel AFK! Nedal DMG.`, "#ff4444"); 
        return { finalDmg: 0 }; 
    } 
    let adjustedMin = baseRange.min; let adjustedMax = baseRange.max; 
    if (role !== "Player" && pugIlvl) { 
        let ilvlFactor = 0.8 + ((pugIlvl - 220) / 69) * 0.5; 
        adjustedMin = Math.floor(baseRange.min * ilvlFactor); 
        adjustedMax = Math.floor(baseRange.max * ilvlFactor); 
    } 
    let baseRoll = 0; 
    if (combatState.cheatDeathTarget === cardIndex) { 
        let roll1 = Math.floor(Math.random() * (adjustedMax - adjustedMin + 1)) + adjustedMin; 
        let roll2 = Math.floor(Math.random() * (adjustedMax - adjustedMin + 1)) + adjustedMin; 
        baseRoll = Math.max(roll1, roll2); 
    } else { baseRoll = Math.floor(Math.random() * (adjustedMax - adjustedMin + 1)) + adjustedMin; } 
    if (traitInfo && traitInfo.id === 'tryhard' && Math.random() < 0.20) baseRoll = Math.floor(baseRoll * 1.5); 
    if (role === "Player" && combatState.piActive) baseRoll = adjustedMax; 
    
    let multiplier = 1.0; 
    if (charName && role !== "Player") { 
        let baseClass = getBaseClass(charName); 
        let synValue = dungeonSynergies[gameState.currentDungeon][baseClass] || 0; 
        if (synValue < 0 && combatState.massDispelActive) synValue = 0; 
        multiplier *= (1 + (synValue / 100)); 
    } 
    if (combatState.bloodlustActive) multiplier *= 1.30; 
    if (playerState.commanderSpell === 'pozitivita') multiplier *= 1.03; 
    
    if (role === "Player") { 
        multiplier *= (1 + (playerState.buffs.enchantCount * 0.05)); 
        if (playerState.buffs.hasFood) multiplier *= 1.05; 
        if (playerState.buffs.hasFlask) multiplier *= 1.20; 
        if (combatState.prepotActive) multiplier *= 1.10; 
        multiplier *= (1 + (playerState.buffs.boeCount * 0.20)); 
        multiplier *= (1 + (playerState.buffs.gemCount * 0.06)); 
    } else { if (playerState.buffs.hasEnergyDrink) multiplier *= 1.10; } 
    return { finalDmg: Math.floor(baseRoll * multiplier) }; 
}

function revealCard(cardIndex, targetHp) { 
    if (combatState.currentRoundDmg[cardIndex] !== undefined) return; 
    playSFX('click');
    let role = ""; let charName = ""; 
    if (cardIndex === 4) role = "Player"; 
    else { 
        charName = playerState.party[cardIndex]; 
        if (charName.includes("Tank")) role = "Tank"; else if (charName.includes("Healer")) role = "Healer"; else role = "DPS"; 
    } 
    let result = calculateDmg(role, damageRanges[role], combatState.partyIlvls[cardIndex], charName, cardIndex); 
    combatState.currentRoundDmg[cardIndex] = result.finalDmg; 
    combatState.cardsRevealed++; 
    renderCombatScreen(); 
}

function updateTotalDmgDisplay() { 
    let totalDmgSoFar = combatState.currentRoundDmg.reduce((a, b) => (a || 0) + (b || 0), 0) + combatState.bRezBonus; 
    let el = document.getElementById('total-dmg-display');
    if (el) el.innerText = totalDmgSoFar; 
    return totalDmgSoFar; 
}

function resolveEncounter(totalDmg, targetHp) {
    let encounter = combatState.encounters[combatState.currentEncounterIndex];
    let timeSpent = encounter.baseTimeCost;
    if (totalDmg >= targetHp) {
        playSFX('win');
        let overkill = (totalDmg - targetHp) / targetHp;
        if (overkill > 0.75) overkill = 0.75;
        if (combatState.bigPullActive) overkill = 0;
        timeSpent = Math.floor(encounter.baseTimeCost * (1 - overkill));
        alert(`EZ! Stálo vás to ${timeSpent} vteřin.`);
        
        combatState.pugTraits.forEach((p, idx) => { 
            if (p && p.active && p.id === 'ninja' && Math.random() < 0.5 && idx !== 4) { 
                let ukradeno = Math.floor(Math.random() * 11) + 5; 
                playerState.gold = Math.max(0, playerState.gold - ukradeno); 
                addChatMessage("System", `🥷 ${combatState.partyNames[idx]} ti sebral ${ukradeno}g!`, "#ff4444"); 
            } 
            if (p && p.active && p.id === 'sugardaddy' && Math.random() < 0.4 && idx !== 4) { 
                let dysko = Math.floor(Math.random() * 11) + 10; 
                playerState.gold += dysko; 
                addChatMessage("System", `💸 ${combatState.partyNames[idx]} se líbilo jak hraješ, dostáváš ${dysko}g!`, "#00ff00"); 
            } 
        });
        combatState.currentEncounterIndex++;
    } else {
        playSFX('wipe');
        alert(`WIPE! Ztratil jsi ${timeSpent} vteřin.`);
        combatState.pugTraits.forEach((p, idx) => { 
            if (p && p.active && p.id === 'ragequitter' && Math.random() < 0.3 && idx !== 4) { 
                p.active = false; 
                addChatMessage("System", `🤬 ${combatState.partyNames[idx]} napsal 'omfg uninstall' a LEAVNUL!`, "#ff4444"); 
            } 
        });
    }
    
    combatState.timeRemaining -= timeSpent;
    if (combatState.prepotCd > 0) combatState.prepotCd--; 
    combatState.partySpells.forEach(ps => { if (ps.spellData.cdType === 'encounter' && ps.currentCd > 0) ps.currentCd--; });
    
    combatState.prepotActive = false; combatState.bloodlustActive = false; combatState.piActive = false; combatState.massDispelActive = false; combatState.cheatDeathTarget = null; combatState.bigPullActive = false; combatState.bRezBonus = 0;
    
    if (combatState.timeRemaining <= 0) { showGameOverScreen(); return; }
    
    if (combatState.currentEncounterIndex >= combatState.encounters.length) {
        playSFX('win');
        let keyUpgrade = 1; 
        if (combatState.timeRemaining >= 420) keyUpgrade = 3; 
        else if (combatState.timeRemaining >= 240) keyUpgrade = 2;
        
        let reward = keyUpgrade === 1 ? 50 : (keyUpgrade === 2 ? 120 : 200);
        gameState.clearedAtLeastOne = true; gameState.lastClearedKey = gameState.currentKeyLevel; gameState.lastClearedDungeon = gameState.currentDungeon;
        playerState.gold += reward; gameState.currentKeyLevel += keyUpgrade;
        
        const randomIndex = Math.floor(Math.random() * dungeonsList.length);
        gameState.currentDungeon = dungeonsList[randomIndex];
        shopItems.forEach(item => currentShopPrices[item.id] = Math.ceil(item.basePrice * (0.7 + (Math.random() * 0.8))));
        
        let mins = Math.floor(combatState.timeRemaining / 60); let secs = combatState.timeRemaining % 60; 
        alert(`GG WP! Dungeon dokončen Čas: ${mins}:${secs < 10 ? '0' : ''}${secs}.\nKlíč se zvedá o +${keyUpgrade} a dostáváš ${reward}g!`);
        
        playerState.buffs.hasFood = false; playerState.buffs.hasFlask = false; playerState.buffs.hasEnergyDrink = false; playerState.buffs.extraRerolls = 0;
        playerState.party = []; playerState.partyTraits = []; setBackground('hub'); showHub(); return;
    }
    combatState.cardsRevealed = 0; combatState.currentRoundDmg = []; renderCombatScreen(); triggerMidRunChat();
}

function showGameOverScreen() {
    playSFX('deplete');
    if (bgmAudio) bgmAudio.pause(); // Stopne hudbu, ať je to depka
    currentBgmName = "";
    gameState.currentScreen = 'gameover'; setBackground('default');
    const app = document.getElementById('game-app'); if (!app) return;
    app.innerHTML = ` <div class="menu-container" style="border-color: #ff0000; box-shadow: 0 0 40px rgba(255,0,0,0.6); max-width: 600px;"><h1 style="color: #ff0000; font-size: 3.5em; text-transform: uppercase;">DEPLETE!</h1><p style="color: #aaa; font-size: 1.2em;">Zpátky do LFG.</p><div style="background-color: #111; padding: 25px; border-radius: 8px; border: 1px solid #555; margin: 30px 0;"><h2 style="color: #ffaa00;">Výpis z pohřbu:</h2><p>Depletnutý klíč: <span style="color: #ff4444; font-weight: bold;">+${gameState.currentKeyLevel} (${gameState.currentDungeon})</span></p><p>Pokořen: <span style="color: #00ff00; font-weight: bold;">${!gameState.clearedAtLeastOne ? "Žádný..." : `+${gameState.lastClearedKey} (${gameState.lastClearedDungeon})`}</span></p></div><button style="border-color: #ff0000; color: #ff5555;" onclick="playSFX('click'); resetGameToMenu()">Zkusit znova</button></div> `;
}

function resetGameToMenu() { playerState.gold = 100; playerState.buffs.enchantCount = 0; playerState.buffs.prepotCount = 0; playerState.buffs.hasFood = false; playerState.buffs.hasFlask = false; playerState.buffs.hasEnergyDrink = false; playerState.buffs.extraRerolls = 0; playerState.buffs.boeCount = 0; playerState.buffs.gemCount = 0; playerState.party = []; playerState.partyTraits = []; gameState.lastClearedKey = 0; gameState.lastClearedDungeon = 'Žádný'; gameState.clearedAtLeastOne = false; initGame(); }

initGame();