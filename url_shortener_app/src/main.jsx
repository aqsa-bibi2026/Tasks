import React,{useState} from "react";
import {createRoot} from "react-dom/client";
import axios from "axios";
import "./style.css";

function App(){
 const [url,setUrl]=useState("");
 const [short,setShort]=useState("");
 const [error,setError]=useState("");
 const [isLoading,setIsLoading]=useState(false);
 const [isCopied,setIsCopied]=useState(false);

 async function shorten(event){
  event.preventDefault();
  setError("");
  setIsCopied(false);

  try{
   const parsedUrl=new URL(url);
   if(!["http:","https:"].includes(parsedUrl.protocol)) throw new Error("Please use an HTTP or HTTPS URL.");
  }catch(validationError){
   setError(validationError.message.includes("HTTP") ? validationError.message : "Please enter a valid URL, including https://.");
   return;
  }

  setIsLoading(true);
  try{
   const res=await axios.post("http://localhost:5000/api/shorten",{url});
   setShort(res.data.shortUrl);
  }catch(requestError){
   setError("We couldn't create that link. Check that the server is running and try again.");
  }finally{
   setIsLoading(false);
  }
 }

 async function copyShortUrl(){
  await navigator.clipboard.writeText(short);
  setIsCopied(true);
  window.setTimeout(()=>setIsCopied(false),2000);
 }

 return <main className="app">
  <div className="topbar"><span className="brand-mark">↗</span><span>Quicklink</span></div>
  <section className="hero" aria-labelledby="page-title">
   <div className="eyebrow">LINKS, WITHOUT THE CLUTTER</div>
   <h1 id="page-title">Make every link<br/><span>easier to share.</span></h1>
   <p className="intro">Turn long, unwieldy URLs into clean links your audience can remember.</p>

   <form className="shorten-form" onSubmit={shorten}>
    <label htmlFor="long-url">Paste your long URL</label>
    <div className="input-row">
     <input id="long-url" type="url" value={url} placeholder="https://your-very-long-link.com/..." onChange={e=>setUrl(e.target.value)} aria-describedby={error ? "form-error" : undefined}/>
     <button type="submit" disabled={isLoading}>{isLoading ? "Creating..." : "Shorten link"}<span aria-hidden="true">↗</span></button>
    </div>
    {error && <p className="error" id="form-error" role="alert">{error}</p>}
   </form>

   {short && <div className="result" aria-live="polite">
    <div><span className="result-label">YOUR SHORT LINK</span><a href={short}>{short}</a></div>
    <button className="copy-button" type="button" onClick={copyShortUrl}>{isCopied ? "Copied" : "Copy link"}</button>
   </div>}
  </section>
  <footer><span>Simple links. Better sharing.</span><span className="status"><i/> Ready when you are</span></footer>
 </main>
}

createRoot(document.getElementById("root")).render(<App/>);