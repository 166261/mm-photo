// ===========================
//  Mm的专属美照库
//  丰富 UI · 动态 · 可编辑
// ===========================

(function(){
    "use strict";

    /* 情话 */
    var QUOTES = [
        "你笑起来真好看，像春天的花一样",
        "遇见你，是我这辈子最幸运的事",
        "你的存在，就是我最好的风景",
        "风华正茂 为你写诗",
        "岁月静好 只因你在",
        "你是我的今天，也是我所有的明天",
        "想把你藏在镜头里，也藏在心里",
        "你在我镜头里，便是最好的作品",
        "世界那么大 能遇见你真好",
        "我的全世界，不过一个你",
        "怎么拍都好看，因为是你",
        "每张照片里都藏着一句喜欢你",
        "看到你，我的世界自动对焦",
        "你的酒窝是我最深的记忆",
        "想用镜头记录你——每秒都心动",
        "今天也想见到你在照片里也在梦里",
        "山有木兮木有枝，心悦君兮君不知",
        " PAGE  ONE DAY 遇到你 连天气都变好了"
    ];

    var RW_QUOTES = [
        "我的相机里住着你",
        "心里也住着你",
        "你看镜头的那一秒我心动了无数次",
        "你是我见过最温柔的风景",
        "人间不值得但你值得",
        "每张偷拍都是一封情书",
        "你稍微温柔一点春天就会来的",
        "我怀疑你作弊了因为不可能有这么好看",
        "月亮代表我的心",
        "手机壁纸该换了",
        "你一笑连天气都好了",
        "今日心动份额已超标",
        "人类一级精品",
        "你的名字是我写过最短的情诗",
        "你是宇宙限量款"
    ];

    /* 状态 */
    var photos=[];
    var filter="all";
    var vIdx=0;
    var slideTimer=null;
    var heroTimer=null;
    var SLIDE_MS=5500;
    var STORE="mm_gallery_v6";
    var slideIdx=0;
    var activeEditId=null;

    function id(){return "p"+Date.now()+"_"+Math.random().toString(36).slice(2,7)}
    function fmt(b){if(b<1024)return b+" B";if(b<1048576)return(b/1024).toFixed(0)+" KB";return(b/1048576).toFixed(1)+" MB"}
    function pick(a){return a[Math.floor(Math.random()*a.length)]}

    function save(){try{localStorage.setItem(STORE,JSON.stringify(photos));return true}catch(e){alert("存储空间不足");return false}}
    function load(){try{var r=localStorage.getItem(STORE);if(r)photos=JSON.parse(r)}catch(e){}}

    /* 打字机 */
    function typing(elId,quotes){
        var el=document.getElementById(elId);
        if(!el)return;
        var qi=0,ci=0,del=false;
        var timer=setInterval(function(){
            if(!del){
                el.textContent=quotes[qi].slice(0,++ci);
                if(ci>=quotes[qi].length){del=true;setTimeout(function(){},2500)}
            }else{
                el.textContent=quotes[qi].slice(0,--ci);
                if(ci<=0){del=false;qi=(qi+1)%quotes.length}
            }
        },del?35:60);
    }

    /* 首页幻灯片 */
    function buildHero(){
        var c=document.getElementById("heroSlide");
        var slides=[{src:"photos/hero-bg.jpg",isHero:true}];
        photos.forEach(function(p){slides.push({src:p.dataUrl,isHero:false})});
        if(slides.length<=1){
            c.style.background="url(photos/hero-bg.jpg) center/cover";
            c.classList.add("show");return;
        }
        slideIdx=0;
        c.style.background="url("+slides[0].src+") center/cover";
        c.classList.add("show");
        var bar=document.getElementById("heroBar");
        var prog=0;
        function tick(){
            if(heroTimer)clearInterval(heroTimer);
            prog=0;bar.style.width="0%";
            heroTimer=setInterval(function(){
                prog+=100/(SLIDE_MS/100);
                if(prog>100)prog=100;
                bar.style.width=prog+"%";
                if(prog>=100){
                    clearInterval(heroTimer);
                    c.classList.remove("show");
                    setTimeout(function(){
                        slideIdx=(slideIdx+1)%slides.length;
                        c.style.background="url("+slides[slideIdx].src+") center/cover";
                        c.classList.add("show");
                    },600);
                    setTimeout(tick,800);
                }
            },100);
        }
        tick();
    }

    // (already handled — defined through closure below)

    /* 跑带 */
    function buildRunway(){
        var c=document.getElementById("runwayItems");
        if(!c)return;
        var items=RW_QUOTES.concat(RW_QUOTES);
        c.innerHTML=items.map(function(t){return "<span>"+t+"</span>"}).join("");
    }

    function setQuotes(){
        var q=document.getElementById("footerQuote");
        if(q)q.textContent=pick(QUOTES);
    }

    /* === 画廊 === */
    function renderFilters(){
        var c=document.getElementById("filters");if(!c)return;
        var cats={};
        for(var i=0;i<photos.length;i++){if(photos[i].category)cats[photos[i].category]=(cats[photos[i].category]||0)+1}
        var btns=[{f:"all",n:"全部 ("+photos.length+")"}];
        Object.keys(cats).forEach(function(k){btns.push({f:k,n:k+" ("+cats[k]+")"})});
        c.innerHTML=btns.map(function(b){
            var act=b.f===filter?" active":"";
            return '<button class="filter-btn'+act+'" data-f="'+b.f+'">'+b.n+"</button>";
        }).join("");

        c.querySelectorAll(".filter-btn").forEach(function(b){
            b.onclick=function(){
                filter=b.getAttribute("data-f");
                renderFilters();
                renderGallery();
                renderManage();
            };
        });
    }

    function renderGallery(){
        var g=document.getElementById("grid");if(!g)return;
        if(!photos.length){
            g.innerHTML="<div style=\"grid-column:1/-1;text-align:center;padding:5rem 2rem;color:var(--fg3);font-size:.95rem;letter-spacing:.12em\">还没有照片，先把她的美照传上来吧 ↑</div>";
            renderFilters();return;
        }
        var f=filter==="all"?photos:photos.filter(function(p){return p.category===filter});
        if(!f.length){g.innerHTML="<div style=\"grid-column:1/-1;text-align:center;padding:4rem;color:var(--fg3)\">此分类暂无照片</div>";return;}
        g.innerHTML=f.map(function(p,i){
            var tags=(p.tags||[]).map(function(t){return"<span>#"+t+"</span>"}).join("");
            return "<div class=\"gcard\" data-i=\""+i+"\" data-id=\""+p.id+"\">"+
                "<img src=\""+p.dataUrl+"\" loading=\"lazy\" alt=\"\">"+
                "<div class=\"gcard-info\">"+
                    "<h4>"+(p.title||p.name)+"</h4>"+
                    (p.place?"<span class=\"g-place\">📍 "+p.place+"</span>":"")+
                    (p.note?"<p class=\"g-note\">"+p.note+"</p>":"")+
                    (tags?"<div class=\"tags\">"+tags+"</div>":"")+
                "</div></div>";
        }).join("");

        g.querySelectorAll(".gcard").forEach(function(c){
            c.onclick=function(){
                var idx=parseInt(c.getAttribute("data-i"));
                // 打开编辑面板 + 全屏预览
                var filtered=filter==="all"?photos:photos.filter(function(x){return x.category===filter});
                openEdit(filtered[idx].id);
                openViewer(idx);
                document.getElementById("editPanel").scrollIntoView({behavior:"smooth",block:"start"});
            };
        });

        // animate-in
        requestAnimationFrame(function(){
            g.querySelectorAll(".gcard").forEach(function(el,i){
                setTimeout(function(){el.classList.add("in-view")},i*55);
            });
        });
        renderFilters();
    }

    /* === 编辑面板 === */
    function openEdit(pid){
        activeEditId=pid;
        var p=null;
        for(var i=0;i<photos.length;i++){if(photos[i].id===pid){p=photos[i];break}}
        if(!p)return;
        var card=document.getElementById("editCard");
        card.className="edit-card has-photo";
        var tags=(p.tags||[]).map(function(t,ti){
            return '<span class="ed-tag">#'+t+'<span class="x" data-i="'+ti+'">×</span></span>';
        }).join("");
        card.innerHTML=
            '<div class="ed-img"><img src="'+p.dataUrl+'" alt=""></div>'+
            '<div class="ed-form">'+
                '<h3>'+(p.title||"未命名")+'</h3>'+
                '<p class="ed-sub">添加更多信息，记录这个瞬间</p>'+
                '<div class="ed-field"><label>照片名称</label><input class="ed-input" id="edTitle" value="'+escapeHtml(p.title||p.name)+'" placeholder="..."></div>'+
                '<div class="ed-field"><label>地点</label><input class="ed-input" id="edPlace" value="'+escapeHtml(p.place||"")+'" placeholder="例如在：杭州西湖"></div>'+
                '<div class="ed-field"><label>日期</label><input class="ed-input" id="edDate" value="'+escapeHtml(p.date||"")+'" placeholder="例如：2024年初秋"></div>'+
                '<div class="ed-field"><label>备注</label><textarea class="ed-input" id="edNote" placeholder="写下你想对这张照片说的话...">'+escapeHtml(p.note||"")+'</textarea></div>'+
                '<div class="ed-field"><label>心情（有梗搞笑）</label><input class="ed-input" id="edMood" value="'+escapeHtml(p.mood||"")+'" placeholder="例如：你一笑我的世界都亮了">'+
                '<div class="ed-field"><label>分类</label><input class="ed-input" id="edCat" value="'+escapeHtml(p.category||"")+'" placeholder="例如：人像 / 街拍"></div>'+
                '<div class="ed-field"><label>标签</label><input class="ed-input" id="edTagInput" placeholder="输入后回车添加...">'+
                    '<div class="ed-tags-line" id="edTags">'+tags+'</div></div>'+
                '<div class="ed-actions">'+
                    '<button class="ed-btn primary" id="edSave">保存</button>'+
                '</div>'+
            '</div>';
        // events
        document.getElementById("edSave").onclick=saveEdit;
        document.getElementById("edTagInput").addEventListener("keydown",function(e){
            if(e.key!=="Enter")return;e.preventDefault();
            var v=this.value.trim();if(!v)return;
            for(var i=0;i<photos.length;i++){if(photos[i].id===pid){if(!photos[i].tags)photos[i].tags=[];if(photos[i].tags.indexOf(v)<0)photos[i].tags.push(v);break}}
            this.value="";save();openEdit(pid);renderGallery();renderManage();
        });
        card.querySelectorAll("#edTags .x").forEach(function(x){
            x.onclick=function(){
                var ti=parseInt(x.getAttribute("data-i"));
                for(var i=0;i<photos.length;i++){if(photos[i].id===pid){photos[i].tags.splice(ti,1);break}}
                save();openEdit(pid);renderGallery();renderManage();
            };
        });
    }

    function escapeHtml(s){return(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}

    function saveEdit(){
        for(var i=0;i<photos.length;i++){
            if(photos[i].id===activeEditId){
                photos[i].title=document.getElementById("edTitle").value.trim();
                photos[i].place=document.getElementById("edPlace").value.trim();
                photos[i].date=document.getElementById("edDate").value.trim();
                photos[i].note=document.getElementById("edNote").value.trim();
                photos[i].mood=document.getElementById("edMood").value.trim();
                photos[i].category=document.getElementById("edCat").value.trim();
                break;
            }
        }
        save();renderGallery();renderManage();
        var hint=document.getElementById("editHint");
        if(hint)hint.textContent="✓ 已保存";
        setTimeout(function(){if(hint)hint.textContent="点击任意照片开始编辑"},2000);
    }

    /* === 整理 === */
    function renderManage(){
        var g=document.getElementById("manageGrid");if(!g)return;
        if(!photos.length){
            g.innerHTML="<div style=\"grid-column:1/-1;text-align:center;padding:5rem;color:var(--fg3);font-size:.9rem\">上传照片后可以在此浏览和编辑所有信息</div>";
            return;
        }
        // 按 filter
        var f=filter==="all"?photos:photos.filter(function(p){return p.category===filter});
        if(!f.length){g.innerHTML="<div style=\"grid-column:1/-1;text-align:center;padding:4rem;color:var(--fg3)\">此分类暂无照片</div>";return;}
        g.innerHTML=f.map(function(p){
            var tags=(p.tags||[]).map(function(t,ti){
                return '<span class="mg-tag">#'+t+'<span class="x" data-pid="'+p.id+'" data-i="'+ti+'">×</span></span>';
            }).join("");
            return '<div class="mg-card" data-id="'+p.id+'">'+
                '<img src="'+p.dataUrl+'" alt="">'+
                '<div class="mg-body">'+
                    '<div class="mg-row"><input class="mg-input mg-title" value="'+escapeHtml(p.title||p.name)+'" placeholder="照片名称..." data-f="title" data-pid="'+p.id+'"></div>'+
                    '<div class="mg-row"><input class="mg-input mg-loc" value="'+escapeHtml(p.place||"")+'" placeholder="📍 地点..." data-f="place" data-pid="'+p.id+'"></div>'+
                    '<div class="mg-row"><input class="mg-input mg-date" value="'+escapeHtml(p.date||"")+'" placeholder="📅 日期..." data-f="date" data-pid="'+p.id+'"></div>'+
                    '<div class="mg-row"><input class="mg-input mg-tag-add" placeholder="输入标签回车..." data-pid="'+p.id+'" style="font-size:.75rem"></div>'+
                    '<div class="mg-tags-wrap" data-pid="'+p.id+'">'+tags+'</div>'+
                '</div>'+
                '<div class="mg-actions"><button class="mg-btn del" data-del="'+p.id+'">删除</button></div>'+
            '</div>';
        }).join("");

        // animate-in
        requestAnimationFrame(function(){
            g.querySelectorAll(".mg-card").forEach(function(el,i){
                setTimeout(function(){el.classList.add("in-view")},i*40);
            });
        });

        // bind events
        g.querySelectorAll(".mg-input[data-f]").forEach(function(inp){
            inp.addEventListener("change",function(e){
                var pid=e.target.getAttribute("data-pid"),f=e.target.getAttribute("data-f");
                for(var i=0;i<photos.length;i++){if(photos[i].id===pid){photos[i][f]=e.target.value.trim();break}}
                save();renderGallery();
            });
        });
        g.querySelectorAll(".mg-tag-add").forEach(function(inp){
            inp.addEventListener("keydown",function(e){
                if(e.key!=="Enter")return;e.preventDefault();
                var pid=e.target.getAttribute("data-pid"),v=e.target.value.trim();if(!v)return;
                for(var i=0;i<photos.length;i++){if(photos[i].id===pid){if(!photos[i].tags)photos[i].tags=[];if(photos[i].tags.indexOf(v)<0)photos[i].tags.push(v);break}}
                e.target.value="";save();renderManage();renderGallery();
            });
        });
        g.querySelectorAll("[data-del]").forEach(function(b){
            b.addEventListener("click",function(e){
                if(!confirm("确定删除这张照片？"))return;
                photos=photos.filter(function(p){return p.id!==e.target.getAttribute("data-del")});
                save();renderManage();renderGallery();buildHero();
            });
        });
        g.querySelectorAll(".mg-tag .x").forEach(function(x){
            x.addEventListener("click",function(e){
                var pid=e.target.getAttribute("data-pid"),ti=parseInt(e.target.getAttribute("data-i"));
                for(var i=0;i<photos.length;i++){if(photos[i].id===pid){photos[i].tags.splice(ti,1);break}}
                save();renderManage();renderGallery();
            });
        });
    }

    /* === 上传 === */
    function setupUpload(){
        var z=document.getElementById("uploadZone"),input=document.getElementById("fileInput"),pick=document.getElementById("btnPick");
        if(z){
            z.onclick=function(e){if(e.target.closest(".uz-promise")||e.target.closest("#btnPick"))return;input.click()};
            z.ondragover=function(e){e.preventDefault();z.classList.add("dragging")};
            z.ondragleave=function(){z.classList.remove("dragging")};
            z.ondrop=function(e){e.preventDefault();z.classList.remove("dragging");if(e.dataTransfer.files.length)handleFiles(e.dataTransfer.files)};
        }
        if(pick)pick.onclick=function(e){e.stopPropagation();input.click()};
        if(input)input.onchange=function(){if(input.files.length)handleFiles(input.files);input.value=""};
    }

    function handleFiles(list){
        var res=document.getElementById("uploadResult");
        res.textContent="上传中...";
        var proc=0,ok=0,total=list.length;
        Array.from(list).forEach(function(file){
            if(!file.type.match(/^image\//))return;
            var r=new FileReader();
            r.onload=function(e){
                photos.push({id:id(),name:file.name,title:file.name.replace(/\.[^.]+$/,"").replace(/[-_]/g," "),place:"",date:"",note:"",category:"",tags:[],dataUrl:e.target.result,size:file.size,ts:Date.now()});
                ok++;proc++;
                if(proc>=total){
                    save();renderGallery();renderManage();buildHero();
                    res.textContent="已成功添加 "+ok+" 张照片";
                    setTimeout(function(){res.textContent=""},3000);
                }
            };
            r.readAsDataURL(file);
        });
        if(total===0)res.textContent="";
    }

    /* === 全屏预览 === */
    function filtered(){return filter==="all"?photos:photos.filter(function(p){return p.category===filter})}
    function openViewer(idx){
        vIdx=0;var f=filtered();if(!f.length)return;
        document.getElementById("viewer").classList.add("open");
        document.body.style.overflow="hidden";
        updateViewer();
    }
    function closeViewer(){document.getElementById("viewer").classList.remove("open");document.body.style.overflow=""}
    function vNext(){var f=filtered();if(!f.length)return;vIdx=(vIdx+1)%f.length;updateViewer()}
    function vPrev(){var f=filtered();if(!f.length)return;vIdx=(vIdx-1+f.length)%f.length;updateViewer()}
    function updateViewer(){
        var f=filtered();if(!f[vIdx]){closeViewer();return}
        var p=f[vIdx],img=document.getElementById("vImg");
        img.style.opacity="0";setTimeout(function(){img.src=p.dataUrl;img.style.opacity="1"},200);
        document.getElementById("vTitle").textContent=p.title||p.name;
        document.getElementById("vLoc").textContent=p.place||"";
        document.getElementById("vDate").textContent=p.date||"";
        document.getElementById("vNote").textContent=p.note||"";
        document.getElementById("vMood").textContent=p.mood||"";
        document.getElementById("vCount").textContent=(vIdx+1)+" / "+f.length;
    }

    function setupViewer(){
        document.getElementById("vClose").onclick=closeViewer;
        document.getElementById("vPrev").onclick=vPrev;
        document.getElementById("vNext").onclick=vNext;
        document.getElementById("viewer").addEventListener("click",function(e){if(e.target===e.currentTarget)closeViewer()});
        document.addEventListener("keydown",function(e){
            if(!document.getElementById("viewer").classList.contains("open"))return;
            if(e.key==="Escape")closeViewer();
            if(e.key==="ArrowRight")vNext();
            if(e.key==="ArrowLeft")vPrev();
        });
        var sx=0,el=document.getElementById("viewer");
        el.addEventListener("touchstart",function(e){sx=e.touches[0].clientX},{passive:true});
        el.addEventListener("touchend",function(e){var ex=e.changedTouches[0].clientX;if(Math.abs(sx-ex)>50)(sx-ex>0?vNext():vPrev())},{passive:true});
    }

    /* === 导航 scroll方向 === */
    function setupNav(){
        var nav=document.getElementById("nav"),lastY=0;
        window.addEventListener("scroll",function(){
            var y=window.scrollY;
            if(y>60)nav.classList.add("scrolled");else nav.classList.remove("scrolled");
            if(y>lastY&&y>100)nav.classList.add("scroll-down");else nav.classList.remove("scroll-down");
            lastY=y;
        });
        document.querySelectorAll(".nav-link").forEach(function(l){
            l.onclick=function(e){
                e.preventDefault();
                var t=document.getElementById(l.getAttribute("href").slice(1));
                if(t)t.scrollIntoView({behavior:"smooth"});
            };
        });
        var dock=document.getElementById("navCta");
        // navCta exists in old html maybe; rely on .dock-btn if any
        var dockBtns=document.querySelectorAll(".dock-btn");
        dockBtns.forEach(function(b){b.onclick=function(e){e.preventDefault();document.getElementById("upload").scrollIntoView({behavior:"smooth"})}});
    }

    /* === Demo 预填充 === */
    function seedDemo(){
        if(photos.length)return;
        try{
            var x=new XMLHttpRequest();
            x.open("GET","data/gallery.json",false);x.send();
            if(x.status===200){
                var d=JSON.parse(x.responseText);
                if(d&&d.photos)d.photos.forEach(function(pp){
                    photos.push({id:id(),name:pp.filename||"demo",title:pp.title||"示例",place:pp.place||"杭州",date:pp.date||"520",note:pp.note||"",mood:pp.mood||"",category:pp.category||"",tags:pp.tags||["示例"],dataUrl:pp.src,size:0,ts:Date.now()});
                });
                save();
            }
        }catch(e){}
    }

    /* === INIT === */
    function init(){
        load();
        seedDemo();
        setupNav();
        setupUpload();
        setupViewer();
        buildRunway();
        buildHero();
        setQuotes();
        renderGallery();
        renderManage();
        // hero reveal
        setTimeout(function(){
            var els=document.querySelectorAll(".hero-cate,.hero-title,.hero-sub,.hero-go");
            els.forEach(function(e){e.classList.add("in")});
            typing("heroSub",QUOTES);
        },400);
    }

    if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);
    else init();

})();