import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  EnvelopeSimple,
  List,
  Phone,
  Play,
  X,
} from "@phosphor-icons/react";
import BlurText from "./components/BlurText";
import ParticleText from "./components/ParticleText";
import { loadManifest, localAsset, useLocalAssetFallback } from "./cosAssets";
import AdminPanel from "./AdminPanel";
import { luoshenCharacterAssets } from "./characterAssets";
import { luoshenSceneAssets } from "./sceneAssets";

const strengths = [
  ["01", "镜头语言", "善于构图与调度，用镜头传递情绪与信息，强化故事沉浸感。"],
  ["02", "叙事节奏", "熟练短剧强节奏剪辑，让每一秒都推动剧情、抓住观众注意力。"],
  ["03", "反转卡点", "擅长铺垫反转与高潮节点，提升剧情张力与完播体验。"],
  ["04", "悬念钩子", "以黄金 3 秒建立冲突，在开头与关键处设置悬念。"],
];

const workflow = ["小说改写", "剧本分镜", "AI 资产图", "视频生成", "剪辑成片"];

const galleryAssets = [
  ...luoshenCharacterAssets,
  ...luoshenSceneAssets,
  { id: "01", category: "characters", fileName: "project-jiuyou.webp", label: "古风角色概念", alt: "暗色古风角色与遗迹场景的 AI 概念图" },
  { id: "02", category: "characters", fileName: "project-mercenary.webp", label: "末日场景资产", alt: "黑甲角色俯瞰废墟城池的 AI 场景图" },
  { id: "03", category: "characters", fileName: "project-boundaries.webp", label: "人物叙事画面", alt: "室内暖光人物对话的 AI 叙事画面" },
  { id: "04", category: "scenes", fileName: "contact-lighthouse.webp", label: "环境氛围概念", alt: "风暴海岸人物与灯塔的 AI 氛围图" },
  { id: "05", category: "scenes", fileName: "hero-editor-studio.webp", label: "夜景空间概念", alt: "夜间剪辑工作室的 AI 空间概念图" },
  { id: "06", category: "characters", fileName: "portrait-editor-bw.webp", label: "黑白人物研究", alt: "剪辑工作室人物的黑白 AI 视觉图" },
];

const optimizedStaticAssets = {
  "project-jiuyou.png": "project-jiuyou.webp",
  "project-mercenary.png": "project-mercenary.webp",
  "project-boundaries.png": "project-boundaries.webp",
  "contact-lighthouse.png": "contact-lighthouse.webp",
  "hero-editor-studio.png": "hero-editor-studio.webp",
  "portrait-editor-bw.png": "portrait-editor-bw.webp",
};

const BRAND_NAME = "Cui Mengyuan";
const GALLERY_PAGE_SIZE = 5;

function migrateLegacyProfile(profile = {}) {
  return {
    ...profile,
    displayName: !profile.displayName || profile.displayName === "李万民" ? BRAND_NAME : profile.displayName,
    aboutPrimary: (profile.aboutPrimary || "").replaceAll("李万民", BRAND_NAME),
    footerCopyright: (profile.footerCopyright || "").replaceAll("李万民", BRAND_NAME),
  };
}

function optimizeSavedAsset(asset) {
  if (asset.url || !optimizedStaticAssets[asset.fileName]) return asset;
  return { ...asset, fileName: optimizedStaticAssets[asset.fileName] };
}

function mergeGalleryAssets(savedAssets) {
  const bundledIds = new Set(galleryAssets.map((asset) => asset.id));
  const saved = Array.isArray(savedAssets) ? savedAssets.map(optimizeSavedAsset) : [];
  return [...galleryAssets, ...saved.filter((asset) => !bundledIds.has(asset.id))];
}

function GalleryGroup({ title, label, assets, onSelect }) {
  const [page, setPage] = useState(0);
  const pageCount = Math.max(1, Math.ceil(assets.length / GALLERY_PAGE_SIZE));

  useEffect(() => {
    setPage((current) => Math.min(current, pageCount - 1));
  }, [pageCount]);

  const visibleAssets = assets.slice(page * GALLERY_PAGE_SIZE, (page + 1) * GALLERY_PAGE_SIZE);

  return (
    <section className="gallery-group" data-reveal>
      <div className="gallery-group-title">
        <small>{label}</small>
        <h3>{title}</h3>
        <span>{assets.length.toString().padStart(2, "0")}</span>
      </div>
      <div className="gallery-grid" key={page} data-gallery-version="paged-v2">
        {visibleAssets.slice(0, GALLERY_PAGE_SIZE).map((asset, index) => {
          const absoluteIndex = page * GALLERY_PAGE_SIZE + index;
          return (
            <button
              className={`gallery-item gallery-item--${index + 1}`}
              type="button"
              key={asset.id}
              onClick={() => onSelect(asset)}
              aria-label={`查看${asset.label}`}
            >
              <img src={asset.url || localAsset(asset.fileName)} data-fallback-src={asset.fileName ? localAsset(asset.fileName) : ""} onError={useLocalAssetFallback} alt={asset.alt} loading="lazy" decoding="async" />
              <span className="gallery-item-shade" />
              <span className="gallery-item-index">{String(absoluteIndex + 1).padStart(2, "0")} / {String(assets.length).padStart(2, "0")}</span>
              <span className="gallery-item-copy">
                <small>AI GENERATED ASSET</small>
                <strong>{asset.label}</strong>
              </span>
            </button>
          );
        })}
      </div>
      {pageCount > 1 && (
        <nav className="gallery-pagination" aria-label={`${title}翻页`}>
          <button className="gallery-nav-button" type="button" onClick={() => setPage((current) => Math.max(0, current - 1))} disabled={page === 0} aria-label="上一页">
            <ArrowLeft size={17} /> 上一页
          </button>
          <div className="gallery-page-dots" aria-label="选择页码">
            {Array.from({ length: pageCount }, (_, index) => (
              <button
                className={index === page ? "gallery-page-dot is-active" : "gallery-page-dot"}
                type="button"
                key={index}
                onClick={() => setPage(index)}
                aria-label={`第 ${index + 1} 页`}
                aria-current={index === page ? "page" : undefined}
              />
            ))}
          </div>
          <div className="gallery-page-status" aria-live="polite">
            <strong>{String(page + 1).padStart(2, "0")}</strong>
            <span>/ {String(pageCount).padStart(2, "0")}</span>
          </div>
          <button className="gallery-nav-button" type="button" onClick={() => setPage((current) => Math.min(pageCount - 1, current + 1))} disabled={page === pageCount - 1} aria-label="下一页">
            下一页 <ArrowRight size={17} />
          </button>
        </nav>
      )}
    </section>
  );
}

export function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeAsset, setActiveAsset] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [content, setContent] = useState({ galleryAssets, projects: [], siteMedia: {}, profile: {} });
  const [manifestReady, setManifestReady] = useState(false);
  const [heroVideoReady, setHeroVideoReady] = useState(false);

  useEffect(() => {
    loadManifest()
      .then((saved) => {
        if (saved) setContent((current) => ({ ...current, ...saved, profile: migrateLegacyProfile(saved.profile), galleryAssets: mergeGalleryAssets(saved.galleryAssets), projects: Array.isArray(saved.projects) ? saved.projects : current.projects }));
      })
      .catch(() => {})
      .finally(() => setManifestReady(true));
  }, []);

  useEffect(() => {
    const nodes = document.querySelectorAll("[data-reveal]");
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("is-visible");
      }),
      { threshold: 0.12 },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const close = (event) => {
      if (event.key === "Escape") {
        setActiveAsset(null);
        setActiveCategory(null);
        setMenuOpen(false);
      }
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);

  useEffect(() => {
    if (!activeAsset && !activeCategory) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [activeAsset]);

  const heroVideoSrc = manifestReady
    ? content.siteMedia.heroVideo || localAsset("hero-editor-studio.mp4")
    : "";

  useEffect(() => {
    setHeroVideoReady(false);
  }, [heroVideoSrc]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <main>
      <header className="site-header">
        <a className="chapter-mark" href="#home" aria-label="返回首页">
          <span /> 01 · 首页
        </a>
        <nav className={menuOpen ? "nav is-open" : "nav"} aria-label="主导航">
          <a href="#about" onClick={closeMenu}>关于</a>
          <i>/</i>
          <a href="#projects" onClick={closeMenu}>项目</a>
          <i>/</i>
          <a href="#gallery" onClick={closeMenu}>画廊</a>
          <i>/</i>
          <a href="#strengths" onClick={closeMenu}>能力</a>
          <i>/</i>
          <a href="#contact" onClick={closeMenu}>联系</a>
        </nav>
        <a className="header-contact" href={`mailto:${content.profile?.email || "13673958331@163.com"}?subject=作品合作咨询`}>
          联系我 <ArrowUpRight size={16} />
        </a>
        <button className="menu-toggle" onClick={() => setMenuOpen((value) => !value)} aria-label="打开导航">
          {menuOpen ? <X size={22} /> : <List size={22} />}
        </button>
      </header>

      <section className="hero" id="home" aria-labelledby="hero-title">
        <video
          className={`hero-video${heroVideoReady ? " is-ready" : ""}`}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          src={heroVideoSrc || undefined}
          data-fallback-src={localAsset("hero-editor-studio.mp4")}
          onCanPlay={() => setHeroVideoReady(true)}
          onError={(event) => {
            setHeroVideoReady(false);
            useLocalAssetFallback(event);
          }}
          aria-hidden="true"
        />
        <div className="hero-shade" />
        <div className="hero-content page-shell">
          <div className="hero-copy">
            <BlurText as="p" text="EDITOR · AI DESIGNER · AI COMIC" delay={90} className="eyebrow" />
            <ParticleText
              id="hero-title"
              className="hero-title-particles"
              text={content.profile?.displayName || BRAND_NAME}
              particleSize={2}
              density={4}
              color="#ffffff"
              highlightColor="#8b5cf6"
              scatter={180}
              gatherDuration={1600}
              stagger={420}
              pointerRepel={0}
              repelRadius={0}
              idleDrift={0.7}
              trigger="hover"
              fontSize="clamp(5.75rem, 10.8vw, 12.25rem)"
              fontWeight={800}
              fontFamily="inherit"
              align="left"
              gradient
            />
            <BlurText as="p" text={content.profile?.heroRole || "剪辑师 / AI设计师 / AI漫剧"} delay={75} className="hero-role" />
            <a className="play-link" href="#projects" data-reveal>
              <span><Play size={13} weight="fill" /></span>
              PLAY REEL
            </a>
          </div>
          <BlurText as="p" text={"用影像讲好故事\n用 AI 拓展想象的边界"} delay={75} className="hero-note" />
        </div>
      </section>

      <section className="about" id="about">
        <div className="about-image" data-reveal>
          <img src={content.siteMedia.portrait || localAsset("about-cinema-editorial.webp")} data-fallback-src={localAsset("about-cinema-editorial.webp")} onError={useLocalAssetFallback} alt="创作者站在黑色放映空间中凝视投影光束" loading="lazy" decoding="async" />
        </div>
        <div className="about-copy">
          <BlurText as="p" text="ABOUT" delay={100} className="eyebrow" />
          <BlurText as="h2" text={"用影像讲好故事，\n用 AI 拓展想象的边界。"} delay={120} />
          <BlurText
            text={content.profile?.aboutPrimary || "我叫 Cui Mengyuan，是一名专注内容叙事与视觉表达的 AI 短剧剪辑师。熟悉真人短剧的粗剪、精剪与节奏把控，也能独立完成 AI 漫剧从小说改写、剧本分镜、资产图建立、视频生成到剪辑成片的完整流程。"}
            delay={32}
          />
          <BlurText
            text={content.profile?.aboutSecondary || "我相信，好故事既要被看见，也值得被更好的方式呈现。AI 是创作伙伴，让想象更高效地落地成片。"}
            delay={38}
          />
          <div className="about-meta" data-reveal>
            <div><span>经历</span><strong>{content.profile?.experienceValue || "2+"}<small>{content.profile?.experienceUnit || "年"}</small></strong></div>
            <div><span>代表项目</span><strong>{content.profile?.projectValue || "8"}<small>{content.profile?.projectUnit || "部+"}</small></strong></div>
            <div><span>制作能力</span><strong>全流程</strong></div>
            <div><span>任职公司</span><b>{content.profile?.companyName || "河南荧灿文化发展"}<br />{content.profile?.companyPeriod || "2024—2026"}</b></div>
          </div>
          <div className="contact-inline" data-reveal>
            <a href={`tel:${(content.profile?.phone || "166 2511 6217").replace(/\s+/g, "")}`}><Phone size={17} />{content.profile?.phone || "166 2511 6217"}</a>
            <a href={`mailto:${content.profile?.email || "13673958331@163.com"}`}><EnvelopeSimple size={17} />{content.profile?.email || "13673958331@163.com"}</a>
          </div>
        </div>
      </section>

      <section className="projects projects--cleared" id="projects">
        <div className="section-heading page-shell">
          <div>
            <BlurText as="p" text="PROJECTS" delay={100} className="eyebrow" />
            <BlurText as="h2" text="精选项目" delay={150} />
          </div>
        </div>
        <div className="project-categories page-shell">
          {[
            ["01", "短剧", "SHORT DRAMA", "shortDrama"],
            ["02", "其他板块", "OTHER WORKS", "otherWorks"],
          ].map(([number, title, label, category]) => {
            const projects = content.projects.filter((project) => (project.category || "shortDrama") === category);
            return <button className="project-category-card project-category-button" type="button" key={category} data-reveal onClick={() => setActiveCategory({ title, label, projects })}><div className="project-category-topline"><span>{number}</span><i aria-hidden="true" /></div><div className="project-category-title"><BlurText as="small" text={label} delay={80} /><BlurText as="h3" text={title} delay={120} /></div><span className="project-category-enter">查看 {projects.length ? `${projects.length} 个项目` : "项目"} →</span></button>;
          })}
        </div>
      </section>

      <section className="gallery" id="gallery" aria-labelledby="gallery-title">
        <div className="section-heading gallery-heading page-shell">
          <div>
            <BlurText as="p" text="AI VISUAL ARCHIVE" delay={80} className="eyebrow" />
            <BlurText as="h2" text="AI 图片资产" delay={130} id="gallery-title" />
          </div>
          <BlurText
            text="角色、场景与叙事画面的视觉资产实验"
            delay={45}
            className="gallery-note"
          />
        </div>

        <div className="gallery-groups page-shell">
          {[ ["characters", "人物资产图", "CHARACTER ASSETS"], ["scenes", "场景资产图", "SCENE ASSETS"] ].map(([category, title, label]) => {
            const assets = content.galleryAssets.filter((asset) => (asset.category || "characters") === category);
            return <GalleryGroup key={category} title={title} label={label} assets={assets} onSelect={setActiveAsset} />;
          })}
        </div>
      </section>

      <section className="workflow page-shell" aria-labelledby="workflow-title">
        <div className="workflow-title">
          <BlurText as="p" text="WORKFLOW" delay={100} className="eyebrow" />
          <BlurText as="h2" text="我的创作流程" delay={115} id="workflow-title" />
        </div>
        <div className="workflow-steps">
          {workflow.map((step, index) => (
            <div key={step}>
              <span>0{index + 1}</span>
              <BlurText as="strong" text={step} delay={80} />
              {index < workflow.length - 1 && <ArrowRight size={20} />}
            </div>
          ))}
        </div>
      </section>

      <section className="strengths page-shell" id="strengths">
        <BlurText as="p" text="STRENGTHS" delay={100} className="eyebrow" />
        <div className="strength-grid">
          {strengths.map(([id, title, body]) => (
            <article key={id}>
              <span>{id}</span>
              <BlurText as="h3" text={title} delay={100} />
              <BlurText text={body} delay={38} />
            </article>
          ))}
        </div>
        <div className="tool-line">
          <span>TOOLS</span>
          <BlurText text="ChatGPT · Codex · Photoshop · Premiere Pro · 剪映 · DaVinci Resolve" delay={45} />
        </div>
      </section>

      <section className="contact" id="contact">
        <img src={content.siteMedia.contactBackground || localAsset("contact-lighthouse.webp")} data-fallback-src={localAsset("contact-lighthouse.webp")} onError={useLocalAssetFallback} alt="风暴海岸与远处灯塔的电影画面" loading="lazy" decoding="async" />
        <div className="contact-overlay" />
        <div className="contact-content page-shell">
          <BlurText as="p" text="CONTACT" delay={100} className="eyebrow" />
          <ParticleText
            className="contact-title-particles"
            text={"期待与你合作，\n把好故事变成好作品。"}
            particleSize={2}
            density={4}
            color="#ffffff"
            highlightColor="#8b5cf6"
            scatter={180}
            gatherDuration={1600}
            stagger={420}
            pointerRepel={0}
            repelRadius={0}
            idleDrift={0.7}
            trigger="hover"
            fontSize="clamp(3.25rem, 6.1vw, 7rem)"
            fontWeight={800}
            fontFamily="inherit"
            align="left"
            gradient
          />
          <div className="contact-actions">
            <a href={`mailto:${content.profile?.email || "13673958331@163.com"}?subject=作品合作咨询`}>
              <BlurText as="span" text="联系我，聊聊你的项目" delay={55} /> <ArrowRight size={21} />
            </a>
            <a href={`tel:${(content.profile?.phone || "166 2511 6217").replace(/\s+/g, "")}`}><BlurText as="span" text={content.profile?.phone || "166 2511 6217"} delay={55} /></a>
          </div>
        </div>
        <footer className="footer page-shell">
          <BlurText as="span" text={content.profile?.footerCopyright || "© 2024—2026 Cui Mengyuan · 保留所有权利"} delay={35} />
          <BlurText as="span" text="AI EDITOR · AVAILABLE FOR WORK" delay={45} />
          <a href="#home" aria-label="返回顶部"><ArrowUp size={16} /> TOP</a>
        </footer>
      </section>

      {activeAsset && (
        <div className="gallery-lightbox" role="dialog" aria-modal="true" aria-labelledby="lightbox-title">
          <button
            className="gallery-lightbox-backdrop"
            type="button"
            onClick={() => setActiveAsset(null)}
            aria-label="关闭图片预览"
          />
          <figure className="gallery-lightbox-frame">
            <button
              className="gallery-lightbox-close"
              type="button"
              onClick={() => setActiveAsset(null)}
              aria-label="关闭"
            >
              <X size={22} />
            </button>
            <img src={activeAsset.url || localAsset(activeAsset.fileName)} data-fallback-src={activeAsset.fileName ? localAsset(activeAsset.fileName) : ""} onError={useLocalAssetFallback} alt={activeAsset.alt} decoding="async" />
            <figcaption>
              <span>{activeAsset.id} / 06</span>
              <strong id="lightbox-title">{activeAsset.label}</strong>
            </figcaption>
          </figure>
        </div>
      )}
      {activeCategory && (
        <div className="project-view" role="dialog" aria-modal="true" aria-labelledby="project-view-title">
          <button className="project-view-backdrop" type="button" onClick={() => setActiveCategory(null)} aria-label="关闭项目列表" />
          <section className="project-view-panel">
            <header><div><small>{activeCategory.label}</small><h2 id="project-view-title">{activeCategory.title}</h2></div><button type="button" onClick={() => setActiveCategory(null)} aria-label="关闭"><X size={22} /></button></header>
            {activeCategory.projects.length ? <div className="project-view-grid">{activeCategory.projects.map((project) => <article key={project.id} className="project-view-item"><img src={project.coverUrl} alt={`${project.title}封面`} loading="lazy" decoding="async" /><div><small>{project.type}</small><h3>{project.title}</h3><p>{project.description}</p>{project.videoUrl ? <video controls preload="metadata" playsInline src={project.videoUrl} aria-label={`播放${project.title}`} /> : <span className="project-view-empty">暂未上传视频</span>}</div></article>)}</div> : <p className="project-view-empty">这里还没有项目，请通过右下角内容管理添加。</p>}
          </section>
        </div>
      )}
      <AdminPanel content={content} onContentChange={setContent} />
    </main>
  );
}
