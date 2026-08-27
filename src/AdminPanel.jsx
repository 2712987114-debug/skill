import { useEffect, useState } from "react";
import { CloudArrowUp, GearSix, Plus, Trash, X } from "@phosphor-icons/react";
import { isCosConfigured, loadCosConfig, saveCosConfig, syncManifest, uploadContentFile } from "./cosAssets";

export default function AdminPanel({ content, onContentChange }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState("");
  const [config, setConfig] = useState(() => loadCosConfig() || { secretId: "", secretKey: "" });
  const [title, setTitle] = useState("");
  const [galleryCategory, setGalleryCategory] = useState("characters");
  const [companyName, setCompanyName] = useState(() => content.profile?.companyName || "河南荧灿文化发展");
  const [companyPeriod, setCompanyPeriod] = useState(() => content.profile?.companyPeriod || "2024—2026");
  const [experienceValue, setExperienceValue] = useState(() => content.profile?.experienceValue || "2+");
  const [experienceUnit, setExperienceUnit] = useState(() => content.profile?.experienceUnit || "年");
  const [projectValue, setProjectValue] = useState(() => content.profile?.projectValue || "8");
  const [projectUnit, setProjectUnit] = useState(() => content.profile?.projectUnit || "部+");
  const [aboutPrimary, setAboutPrimary] = useState(() => content.profile?.aboutPrimary || "我叫李万民，是一名专注内容叙事与视觉表达的 AI 短剧剪辑师。熟悉真人短剧的粗剪、精剪与节奏把控，也能独立完成 AI 漫剧从小说改写、剧本分镜、资产图建立、视频生成到剪辑成片的完整流程。");
  const [aboutSecondary, setAboutSecondary] = useState(() => content.profile?.aboutSecondary || "我相信，好故事既要被看见，也值得被更好的方式呈现。AI 是创作伙伴，让想象更高效地落地成片。");
  const [phone, setPhone] = useState(() => content.profile?.phone || "166 2511 6217");
  const [email, setEmail] = useState(() => content.profile?.email || "13673958331@163.com");
  const [displayName, setDisplayName] = useState(() => content.profile?.displayName || "李万民");
  const [heroRole, setHeroRole] = useState(() => content.profile?.heroRole || "剪辑师 / AI设计师 / AI漫剧");
  const [footerCopyright, setFooterCopyright] = useState(() => content.profile?.footerCopyright || "© 2024—2026 李万民 · 保留所有权利");

  useEffect(() => {
    const profile = content.profile || {};
    setCompanyName(profile.companyName || "河南荧灿文化发展");
    setCompanyPeriod(profile.companyPeriod || "2024—2026");
    setExperienceValue(profile.experienceValue || "2+");
    setExperienceUnit(profile.experienceUnit || "年");
    setProjectValue(profile.projectValue || "8");
    setProjectUnit(profile.projectUnit || "部+");
    setAboutPrimary(profile.aboutPrimary || "我叫李万民，是一名专注内容叙事与视觉表达的 AI 短剧剪辑师。熟悉真人短剧的粗剪、精剪与节奏把控，也能独立完成 AI 漫剧从小说改写、剧本分镜、资产图建立、视频生成到剪辑成片的完整流程。");
    setAboutSecondary(profile.aboutSecondary || "我相信，好故事既要被看见，也值得被更好的方式呈现。AI 是创作伙伴，让想象更高效地落地成片。");
    setPhone(profile.phone || "166 2511 6217");
    setEmail(profile.email || "13673958331@163.com");
    setDisplayName(profile.displayName || "李万民");
    setHeroRole(profile.heroRole || "剪辑师 / AI设计师 / AI漫剧");
    setFooterCopyright(profile.footerCopyright || "© 2024—2026 李万民 · 保留所有权利");
  }, [content.profile]);

  async function saveConfig() {
    if (!config.secretId.trim() || !config.secretKey.trim()) {
      setStatus("请完整填写 SecretId 和 SecretKey。");
      return;
    }
    try {
      setStatus("正在验证 COS 授权并同步当前网站内容…");
      saveCosConfig(config);
      await syncManifest(content);
      setStatus("COS 授权有效，当前内容清单已同步到存储桶。现在可以上传作品。");
    } catch (error) {
      setStatus(`COS 连接或同步失败：${error.message}`);
    }
  }
  async function uploadGallery(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setStatus("正在上传图片并同步内容…");
      const url = await uploadContentFile(file, "content/gallery");
      const next = { ...content, galleryAssets: [...content.galleryAssets, { id: crypto.randomUUID(), category: galleryCategory, url, label: title.trim() || file.name, alt: title.trim() || file.name }] };
      await syncManifest(next);
      onContentChange(next);
      setTitle(""); setStatus("已上传到 COS，画廊已自动同步。");
    } catch (error) { setStatus(error.message); }
    event.target.value = "";
  }
  async function uploadSiteMedia(event) {
    const file = event.target.files?.[0]; const field = event.target.dataset.field;
    if (!file || !field) return;
    try {
      setStatus("正在上传页面素材并同步…");
      const url = await uploadContentFile(file, "content/site");
      const next = { ...content, siteMedia: { ...content.siteMedia, [field]: url } };
      await syncManifest(next); onContentChange(next); setStatus("页面素材已同步到 COS。");
    } catch (error) { setStatus(error.message); }
    event.target.value = "";
  }
  async function saveProfile() {
    if (![companyName, companyPeriod, experienceValue, experienceUnit, projectValue, projectUnit, aboutPrimary, aboutSecondary, phone, email, displayName, heroRole, footerCopyright].every((value) => value.trim())) return setStatus("请完整填写首页、关于我与联系方式。");
    try {
      setStatus("正在同步关于我与联系方式…");
      const next = { ...content, profile: { ...content.profile, companyName: companyName.trim(), companyPeriod: companyPeriod.trim(), experienceValue: experienceValue.trim(), experienceUnit: experienceUnit.trim(), projectValue: projectValue.trim(), projectUnit: projectUnit.trim(), aboutPrimary: aboutPrimary.trim(), aboutSecondary: aboutSecondary.trim(), phone: phone.trim(), email: email.trim(), displayName: displayName.trim(), heroRole: heroRole.trim(), footerCopyright: footerCopyright.trim() } };
      await syncManifest(next);
      onContentChange(next);
      setStatus("关于我与联系方式已同步，访客刷新后即可看到。");
    } catch (error) { setStatus(error.message); }
  }
  async function removeGalleryAsset(asset) {
    if (!window.confirm(`确认从网站移除「${asset.label}」吗？`)) return;
    try {
      setStatus("正在移除图片并同步…");
      const next = { ...content, galleryAssets: content.galleryAssets.filter((item) => item.id !== asset.id) };
      await syncManifest(next);
      onContentChange(next);
      setStatus("图片已从网站移除，访客刷新后将不再看到它。");
    } catch (error) { setStatus(error.message); }
  }
  async function addProject(event) {
    event.preventDefault(); const form = new FormData(event.currentTarget); const cover = form.get("cover"); const video = form.get("video");
    if (!(cover instanceof File) || !cover.size) return setStatus("请为项目选择背景图片。");
    try {
      setStatus("正在上传项目素材并同步…");
      const coverUrl = await uploadContentFile(cover, "content/projects");
      const videoUrl = video instanceof File && video.size ? await uploadContentFile(video, "content/videos") : "";
      const next = { ...content, projects: [...content.projects, { id: crypto.randomUUID(), category: form.get("projectCategory"), title: form.get("projectTitle"), type: form.get("projectType"), description: form.get("projectDescription"), coverUrl, videoUrl }] };
      await syncManifest(next); onContentChange(next); event.currentTarget.reset(); setStatus("项目已添加并同步到 COS。");
    } catch (error) { setStatus(error.message); }
  }
  async function removeProject(project) {
    if (!window.confirm(`确认从网站移除「${project.title}」吗？`)) return;
    try {
      setStatus("正在移除项目并同步…");
      const next = { ...content, projects: content.projects.filter((item) => item.id !== project.id) };
      await syncManifest(next);
      onContentChange(next);
      setStatus("项目已从网站移除，访客刷新后将不再看到它。");
    } catch (error) { setStatus(error.message); }
  }
  if (!open) return <button className="admin-entry" type="button" onClick={() => setOpen(true)} aria-label="打开内容管理"><GearSix size={20} /></button>;
  return <aside className="admin-drawer" aria-label="内容管理"><header><strong>内容管理</strong><button type="button" onClick={() => setOpen(false)}><X size={20} /></button></header><div className="admin-scroll">
    <p className="admin-note">桶：cuimengyuan-1473942157（广州）。视频、图片和内容清单都会自动同步到 COS，访客刷新后即可看到。</p>
    <section><h3>腾讯云 COS 授权</h3><input placeholder="SecretId（建议使用仅限此桶写入的子账号）" value={config.secretId} onChange={(e) => setConfig({ ...config, secretId: e.target.value })}/><input type="password" placeholder="SecretKey" value={config.secretKey} onChange={(e) => setConfig({ ...config, secretKey: e.target.value })}/><button type="button" onClick={saveConfig}>保存授权并同步当前内容</button><p className="admin-note">密钥仅保存在当前浏览器，不会提交到 GitHub。</p></section>
    <section><h3>首页、关于我与联系方式</h3><label>首页姓名<input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="例如：李万民" /></label><label>首页职业描述<input value={heroRole} onChange={(e) => setHeroRole(e.target.value)} placeholder="例如：剪辑师 / AI设计师 / AI漫剧" /></label><label>第一段个人介绍<textarea value={aboutPrimary} onChange={(e) => setAboutPrimary(e.target.value)} /></label><label>第二段个人介绍<textarea value={aboutSecondary} onChange={(e) => setAboutSecondary(e.target.value)} /></label><label>经历数字<input value={experienceValue} onChange={(e) => setExperienceValue(e.target.value)} placeholder="例如：2+" /></label><label>经历单位<input value={experienceUnit} onChange={(e) => setExperienceUnit(e.target.value)} placeholder="例如：年" /></label><label>代表项目数字<input value={projectValue} onChange={(e) => setProjectValue(e.target.value)} placeholder="例如：8" /></label><label>代表项目单位<input value={projectUnit} onChange={(e) => setProjectUnit(e.target.value)} placeholder="例如：部+" /></label><label>公司名称<input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="例如：河南荧灿文化发展" /></label><label>任职时间<input value={companyPeriod} onChange={(e) => setCompanyPeriod(e.target.value)} placeholder="例如：2024—2026" /></label><label>手机号<input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="例如：166 2511 6217" /></label><label>邮箱<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="例如：name@example.com" /></label><label>页脚版权文字<input value={footerCopyright} onChange={(e) => setFooterCopyright(e.target.value)} placeholder="例如：© 2024—2026 李万民 · 保留所有权利" /></label><button type="button" onClick={saveProfile}>保存首页、关于我与联系方式</button></section>
    <section><h3>页面背景与素材</h3><label>首页背景视频<input type="file" accept="video/*" data-field="heroVideo" onChange={uploadSiteMedia}/></label><label>首页背景图<input type="file" accept="image/*" data-field="heroPoster" onChange={uploadSiteMedia}/></label><label>关于页图片<input type="file" accept="image/*" data-field="portrait" onChange={uploadSiteMedia}/></label><label>联系页背景<input type="file" accept="image/*" data-field="contactBackground" onChange={uploadSiteMedia}/></label></section>
    <section><h3>添加图片资产</h3><label>图片归类<select value={galleryCategory} onChange={(e) => setGalleryCategory(e.target.value)}><option value="characters">人物资产图</option><option value="scenes">场景资产图</option></select></label><input placeholder="图片名称" value={title} onChange={(e) => setTitle(e.target.value)}/><label className="upload-label"><CloudArrowUp size={18}/>选择图片<input type="file" accept="image/*" onChange={uploadGallery}/></label></section>
    {content.galleryAssets.length > 0 && <section><h3>已发布图片资产</h3><div className="admin-project-list">{content.galleryAssets.map((asset) => <div key={asset.id} className="admin-project-row"><span><strong>{asset.label}</strong><small>{asset.category === "scenes" ? "场景资产图" : "人物资产图"}</small></span><button type="button" className="admin-delete" onClick={() => removeGalleryAsset(asset)} aria-label={`删除${asset.label}`}><Trash size={16}/>删除</button></div>)}</div></section>}
    <section><h3>添加项目</h3><form onSubmit={addProject}><label>项目归类<select name="projectCategory" defaultValue="shortDrama"><option value="shortDrama">短剧</option><option value="otherWorks">其他板块</option></select></label><input name="projectTitle" required placeholder="项目名称"/><input name="projectType" required placeholder="项目类型，例如 AI 漫剧"/><textarea name="projectDescription" placeholder="项目简介"/><label>项目背景图片<input name="cover" type="file" accept="image/*" required/></label><label>项目视频（访客可点击播放）<input name="video" type="file" accept="video/*"/></label><button type="submit"><Plus size={16}/>添加并同步</button></form></section>
    {content.projects.length > 0 && <section><h3>已发布项目</h3><div className="admin-project-list">{content.projects.map((project) => <div key={project.id} className="admin-project-row"><span><strong>{project.title}</strong><small>{project.category === "otherWorks" ? "其他板块" : "短剧"} · {project.type}</small></span><button type="button" className="admin-delete" onClick={() => removeProject(project)} aria-label={`删除${project.title}`}><Trash size={16}/>删除</button></div>)}</div></section>}
    <p className="admin-status">{status || (isCosConfigured() ? "COS 已配置，可以上传。" : "请先保存 COS 授权后再上传。")}</p>
  </div></aside>;
}
