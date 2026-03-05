
import { useState, useEffect, useRef } from "react";
import { Zap, Target, Printer } from "lucide-react";
import { ImageIcon } from "lucide-react";
import { UploadCloud, Wand2, Download } from "lucide-react";
import "./index.css";

function App() {
  const [image, setImage] = useState(null);
  const [size, setSize] = useState("india");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("auto"); // auto or manual
  const [zoom, setZoom] = useState(1);
  const [verticalShift, setVerticalShift] = useState(0);
  const [horizontalShift, setHorizontalShift] = useState(0);
  const fileInputRef = useRef(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);


  const canvasRef = useRef(null);
  const countries = {
  india: { label: "🇮🇳 India (35x45 mm)", width: 350, height: 450 },
  us: { label: "🇺🇸 USA (2x2 inch)", width: 400, height: 400 },
  uk: { label: "🇬🇧 UK (35x45 mm)", width: 350, height: 450 },
  canada: { label: "🇨🇦 Canada (50x70 mm)", width: 500, height: 700 },
  australia: { label: "🇦🇺 Australia (35x45 mm)", width: 350, height: 450 },
  germany: { label: "🇩🇪 Germany (35x45 mm)", width: 350, height: 450 },
  japan: { label: "🇯🇵 Japan (35x45 mm)", width: 350, height: 450 }
};
  const handleImageUpload = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const imageUrl = URL.createObjectURL(file);
  setImage(imageUrl);
};

const handleRemoveBackground = async () => {
  if (!image) return;

  setLoading(true);

  try {
    const response = await fetch(image);
    const blob = await response.blob();

    const formData = new FormData();
    formData.append("image", blob);

    const removeResponse = await fetch(
"http://localhost:5000/remove-bg",
{
method: "POST",
body: formData
}
);

    if (!removeResponse.ok) {
      const errorText = await removeResponse.text();
      console.log(errorText);
      throw new Error("Background removal failed");
    }

    const resultBlob = await removeResponse.blob();
    const resultUrl = URL.createObjectURL(resultBlob);

    setImage(resultUrl);

  } catch (error) {
    console.error(error);
    alert("Background removal failed");
  }

  setLoading(false);
};

  const handleDownload = () => {
  if (!image) return;

  const img = new Image();
  img.src = image;

  img.onload = () => {

    const width = countries[size].width;
    const height = countries[size].height;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    const targetRatio = width / height;

    let cropHeight = img.height;
    let cropWidth = img.width;

    if (img.width / img.height > targetRatio) {
      cropHeight = img.height;
      cropWidth = img.height * targetRatio;
    } else {
      cropWidth = img.width;
      cropHeight = img.width / targetRatio;
    }

    if (mode === "manual") {
      cropHeight = cropHeight / zoom;
      cropWidth = cropWidth / zoom;
    }

    let sx = (img.width - cropWidth) / 2;
    let sy = (img.height - cropHeight) / 2;

    if (mode === "manual") {
      sy += verticalShift;
      sx += horizontalShift;
    }

    if (sx < 0) sx = 0;
    if (sy < 0) sy = 0;
    if (sx + cropWidth > img.width)
      sx = img.width - cropWidth;
    if (sy + cropHeight > img.height)
      sy = img.height - cropHeight;

    ctx.drawImage(
      img,
      sx,
      sy,
      cropWidth,
      cropHeight,
      0,
      0,
      width,
      height
    );

    const link = document.createElement("a");
    link.download = "passport-photo.jpg";
    link.href = canvas.toDataURL("image/jpeg", 1);
    link.click();
  };
};

const handlePrintSheet = () => {
  if (!image) return;
  
  const a4Width = 2480;   // A4 width at 300 DPI
  const a4Height = 3508;  // A4 height at 300 DPI

  const canvas = document.createElement("canvas");
  canvas.width = a4Width;
  canvas.height = a4Height;

  const ctx = canvas.getContext("2d");

  // White background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, a4Width, a4Height);

  // Get final cropped passport from preview canvas
  const source = canvasRef.current;

  // Scale passport size properly for printing
  const photoWidth = 413;
  const photoHeight = 531;
  
  
  

  const columns = 3;
  const rows = 3;

  const spacingX = 100;
  const spacingY = 100;;

  const totalWidth = columns * photoWidth + (columns - 1) * spacingX;
  const totalHeight = rows * photoHeight + (rows - 1) * spacingY;

  const startX = (a4Width - totalWidth) / 2;
  const startY = (a4Height - totalHeight) / 2;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      ctx.drawImage(
        source,
        startX + col * (photoWidth + spacingX),
        startY + row * (photoHeight + spacingY),
        photoWidth,
        photoHeight
      );
ctx.strokeStyle = "#000000";
ctx.lineWidth = 2;

ctx.strokeRect(
  startX + col * (photoWidth + spacingX),
  startY + row * (photoHeight + spacingY),
  photoWidth,
  photoHeight
);
    }
  }

  const link = document.createElement("a");
  link.download = "passport-print-sheet.jpg";
  link.href = canvas.toDataURL("image/jpeg", 1);
  link.click();
};




useEffect(() => {
  if (!image) return;
  

  const img = new Image();
  img.src = image;

  img.onload = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const width = countries[size].width;
    const height = countries[size].height;

    canvas.width = width;
    canvas.height = height;

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    const targetRatio = width / height;

    let cropHeight = img.height;
    let cropWidth = img.width;

    // Adjust for aspect ratio
    if (img.width / img.height > targetRatio) {
      cropHeight = img.height;
      cropWidth = img.height * targetRatio;
    } else {
      cropWidth = img.width;
      cropHeight = img.width / targetRatio;
    }

    // Apply manual zoom
    if (mode === "manual") {
      cropHeight = cropHeight / zoom;
      cropWidth = cropWidth / zoom;
    }

    let sx = (img.width - cropWidth) / 2;
let sy = (img.height - cropHeight) / 2;

if (mode === "manual") {
  sy += verticalShift;
  sx += horizontalShift;
}

    // Boundaries
    if (sx < 0) sx = 0;
    if (sy < 0) sy = 0;
    if (sx + cropWidth > img.width)
      sx = img.width - cropWidth;
    if (sy + cropHeight > img.height)
      sy = img.height - cropHeight;

    ctx.drawImage(
      img,
      sx,
      sy,
      cropWidth,
      cropHeight,
      0,
      0,
      width,
      height
    );
  };

}, [image, size, bgColor, zoom, verticalShift, horizontalShift, mode]);


useEffect(() => {
  const handleResize = () => {
    setIsMobile(window.innerWidth < 768);
  };

  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}, []);

  return (
  <div style={styles.page}>

    {/* NAVBAR */}
    <nav style={styles.navbar}>
      <div style={styles.logo}>Passportly</div>

   {!isMobile && (
<div style={styles.navLinks}>

  <span
    onClick={() => {
      document.getElementById("how")?.scrollIntoView({ behavior: "smooth" });
    }}
  >
    How It Works
  </span>

  <span
    onClick={() => {
      document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
    }}
  >
    Features
  </span>

  <span
    onClick={() => {
      document.getElementById("free")?.scrollIntoView({ behavior: "smooth" });
    }}
  >
    Free
  </span>


</div>

)}
<button
  style={styles.navButton}
  onClick={() => {
    if (image === "/models/image (15).png") {
      setImage(null);
    } else {
      setImage("/models/image (15).png");
      setZoom(1);
      setVerticalShift(0);
      setHorizontalShift(0);
    }
  }}
>
  {image === "/models/image (15).png" ? "Clear Demo" : "Try Demo"}
</button>
    </nav>


    {/* HERO SECTION */}
    <section style={styles.hero}>

      {/* LEFT SIDE TEXT */}
      <div style={styles.heroLeft}>
        <h1 style={styles.heroTitle}>
  Create perfect <span style={{ color: "#60a5fa" }}>passport photos</span> in seconds
</h1>

        <p style={styles.heroSubtitle}>
          AI background removal. Auto sizing. Instant A4 print sheet.
        </p>

        <button
  style={styles.heroCTA}
  onClick={() => {
    document.getElementById("tool")?.scrollIntoView({ behavior: "smooth" });
  }}
>
  Get Started →
</button>
      </div>


      {/* RIGHT SIDE TOOL */}
      <div id="tool" style={styles.heroRight}>

  {/* GLOW BACKGROUND */}
  <div style={styles.glow}></div>

  {/* TOOL WRAPPER */}
  <div style={{ ...styles.container, position: "relative", zIndex: 1 }}>
    <div style={styles.appWrapper}>

            {/* LEFT PANEL */}
            <div className="controls heroPanel" style={styles.controls}>
              

              <div
  style={styles.uploadBox}
  onClick={() => fileInputRef.current.click()}
  onDragOver={(e) => e.preventDefault()}
  onDrop={(e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleImageUpload({ target: { files: [file] } });
  }}
>

  <input
    ref={fileInputRef}
    type="file"
    accept="image/*"
    onChange={handleImageUpload}
    style={{ display: "none" }}
  />

  {image ? (
    <canvas ref={canvasRef} style={styles.uploadPreview}></canvas>
  ) : (
    <>
      <div style={styles.uploadIcon}>⬆</div>
      <p style={styles.uploadText}>
        Drag & Drop or Click to Upload
      </p>

          <label style={styles.uploadButton}>
        Browse Files
      </label>
    </>
  )}

</div>

<div style={styles.controlsScroll}>

              <button
  onClick={handleRemoveBackground}
  disabled={!image || loading}
  style={{
    ...styles.button,
    opacity: !image || loading ? 0.5 : 1,
    cursor: !image || loading ? "not-allowed" : "pointer"
  }}
>
  {loading ? (
    <>
      <span className="spinner"></span>
      Removing...
    </>
  ) : (
    "Remove Background"
  )}
</button>     

              <select
                value={size}
                onChange={(e) => setSize(e.target.value)}
                style={styles.select}
              >
                {Object.keys(countries).map((key) => (
                  <option key={key} value={key}>
                    {countries[key].label}
                  </option>
                ))}
              </select>

              

             

              

              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                style={styles.select}
              >
                <option value="auto">Auto Crop</option>
                <option value="manual">Manual Adjust</option>
              </select>

              {mode === "manual" && (
                <div style={styles.manualBox}>
                  <div style={styles.sliderGroup}>
                    <label style={styles.sliderLabel}>Zoom</label>
                    <input
                      type="range"
                      min="0.8"
                      max="2"
                      step="0.05"
                      value={zoom}
                      onChange={(e) => setZoom(parseFloat(e.target.value))}
                      style={styles.slider}
                    />
                  </div>

                  <div style={styles.sliderGroup}>
                    <label style={styles.sliderLabel}>Move Up / Down</label>
                    <input
                      type="range"
                      min="-120"
                      max="120"
                      step="5"
                      value={verticalShift}
                      onChange={(e) => setVerticalShift(parseInt(e.target.value))}
                      style={styles.slider}
                    />
                  </div>

                  <div style={styles.sliderGroup}>
                    <label style={styles.sliderLabel}>Move Left / Right</label>
                    <input
                      type="range"
                      min="-200"
                      max="200"
                      step="5"
                      value={horizontalShift}
                      onChange={(e) => setHorizontalShift(parseInt(e.target.value))}
                      style={styles.slider}
                    />
                  </div>
                </div>
              )}

              <select
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                style={styles.select}
              >
                <option value="#ffffff">White</option>
                <option value="#87CEEB">Light Blue</option>
                <option value="#e0e0e0">Light Gray</option>
              </select>

              <button
  style={{
    ...styles.downloadButton,
    opacity: image ? 1 : 0.5,
    cursor: image ? "pointer" : "not-allowed"
  }}
  onClick={handleDownload}
  disabled={!image}
>
  Download Photo
</button>

           <button
  style={{
    ...styles.printButton,
    opacity: image ? 1 : 0.5,
    cursor: image ? "pointer" : "not-allowed"
  }}
  onClick={handlePrintSheet}
  disabled={!image}
>
  Download A4 Print Sheet
</button>
            </div>


            
</div>
          </div>
        </div>

      </div>

    </section>


<div style={styles.sectionDivider}></div>

{/* HOW IT WORKS */}
<section id="how" style={styles.howSection}>

  <h2 style={styles.howTitle}>How It Works</h2>

  <div style={styles.howGrid}>

    <div className="howCard" style={styles.howCard}>
      <div style={styles.howIcon}>
        <UploadCloud size={28} strokeWidth={1.5} />
      </div>
      <h3 style={styles.stepHeading}>Upload Your Photo</h3>
      <p style={styles.stepText}>
        Drag and drop your image to begin instantly.
      </p>
    </div>

    <div className="howCard" style={styles.howCard}>
      <div style={styles.howIcon}>
        <Wand2 size={28} strokeWidth={1.5} />
      </div>
      <h3 style={styles.stepHeading}>Adjust & Remove Background</h3>
      <p style={styles.stepText}>
        Automatically crop and fine-tune your passport photo.
      </p>
    </div>

    <div className="howCard" style={styles.howCard}>
      <div style={styles.howIcon}>
        <Download size={28} strokeWidth={1.5} />
      </div>
      <h3 style={styles.stepHeading}>Download or Print</h3>
      <p style={styles.stepText}>
        Get your photo or ready-to-print A4 sheet instantly.
      </p>
    </div>

  </div>

</section>


<div style={styles.sectionDivider}></div>


  {/* FEATURES SECTION */}
<section id='features' style={styles.featuresSection}>

  <h2 style={styles.featuresTitle}>
    Why use Passportly?
  </h2>

  <div style={styles.featuresGrid}>

    <div className="featureCard" style={styles.featureCard}>
      <div style={styles.featureIcon}>
  <Zap size={28} />
</div>
      <h3 style={styles.featureHeading}>Instant Processing</h3>
      <p style={styles.featureText}>
        Generate passport-size photos in seconds with automatic cropping.
      </p>
    </div>

    <div className="featureCard" style={styles.featureCard}>
      <div style={styles.featureIcon}>
  <Target size={28} />
</div>
      <h3 style={styles.featureHeading}>Perfect Sizing</h3>
      <p style={styles.featureText}>
        Supports India, USA, UK, Canada, and more official formats.
      </p>
    </div>

    <div className="featureCard" style={styles.featureCard}>
      <div style={styles.featureIcon}>
<Printer size={28} />
</div>
      <h3 style={styles.featureHeading}>A4 Print Ready</h3>
      <p style={styles.featureText}>
        Download a ready-to-print A4 sheet with multiple copies.
      </p>
    </div>

  </div>

</section>


<div style={styles.sectionDivider}></div>


{/* FREE SECTION */}
<section id="free" style={styles.freeSection}>
  <h2 style={styles.freeTitle}>
    100% Free. No Signup. No Watermark.
  </h2>

  <p style={styles.freeText}>
    Create passport-size photos instantly without creating an account.
    Download high-quality images and A4 print sheets for free.
  </p>

  
</section>



<footer style={styles.footer}>
  <div style={styles.footerContent}>
    
    <div style={styles.footerBrand}>
      Passport Photo Maker
    </div>

    <div style={styles.footerLinks}>
      <a href="#features">Features</a>
      <a href="#how">How It Works</a>
      <a href="#free">Free</a>
    </div>

    <div style={styles.footerCopy}>
      © {new Date().getFullYear()} Passport Photo Maker
    </div>
    <div style={styles.footerCopy}>Designed & Developed by
        <span style={{color:"#ccc9c9"}}> Sumedh Sakpal</span>
    </div>

  </div>
</footer>
  </div>
);
}



const styles = {
  container: {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "transparent"
},
  card: {
    background: "#ffffff",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
    textAlign: "center",
    width: "400px",
  },
  title: {
    marginBottom: "20px",
  },
  input: {
    marginBottom: "20px",
  },
  previewBox: {
    marginTop: "10px",
  },
  image: {
    width: "250px",
    borderRadius: "8px",
  },
select: {
  padding: "12px",
  width: "100%",
  borderRadius: "12px",
  backgroundColor: "#1e293b",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "#ffffff",
  fontSize: "14px",
  appearance: "none",
  WebkitAppearance: "none",
  MozAppearance: "none",
  cursor: "pointer"

},


button: {
  padding: "14px",
  width: "100%",
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "12px",
  fontWeight: "600",
  cursor: "pointer"
},

appWrapper: {
  display: "flex",
  flexWrap: "wrap",
  gap: "40px",
  width: "100%",
  maxWidth: "1100px"
},

controls:{
  width:"100%",
  maxWidth:"390px",
  minHeight:"75vh",
  background:"rgba(30,41,59,0.85)",
  padding:"20px",
  borderRadius:"20px",
  border:"1px solid rgba(255,255,255,0.08)",
  boxShadow:"0 20px 60px rgba(0,0,0,0.4)",
  display:"flex",
  flexDirection:"column",
  gap:"12px"
},


controlsScroll:{
  flex:1,
  overflowY:"auto",
  display:"flex",
  flexDirection:"column",
  gap:"10px"
},

preview: {
  flex: 1,
  background: "rgba(255,255,255,0.05)",
  backdropFilter: "blur(10px)",
  borderRadius: "16px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  border: "1px solid rgba(255,255,255,0.1)",
  padding: "40px",
  minHeight: "420px"
},

canvasLarge: {
  maxWidth: "100%",
  height: "auto",
  borderRadius: "12px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.15)"
},
downloadButton: {
  marginTop: "2px",
  padding: "14px",
  width: "100%",
  backgroundColor: "#111",
  color: "#fff",
  border: "none",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "600"
},

uploadBox:{
  padding:"18px",
  minHeight:"260px",
  border:"1px dashed rgba(255,255,255,0.12)",
  borderRadius:"16px",
  textAlign:"center",
  background:"rgba(15,23,42,0.85)",
  backdropFilter:"blur(4px)",
  display:"flex",
  flexDirection:"column",
  justifyContent:"center",
  alignItems:"center"
},

uploadPreview:{
  width:"200px",
  height:"260px",
  borderRadius:"14px",
  display:"block",
  objectFit:"contain"
},



uploadIcon: {
  fontSize: "32px",
  marginBottom: "10px"
},




uploadText: {
  fontSize: "14px",
  color: "#555",
  marginBottom: "15px"
},

uploadButton: {
  display: "inline-block",
  padding: "10px 20px",
  background: "rgba(255,255,255,0.08)",
  color: "#fff",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "500",
  fontSize: "14px",
  border: "1px solid rgba(255,255,255,0.15)"
},


hiddenInput: {
  display: "none"
},

manualBox: {
  marginTop: "10px",
  padding: "16px",
  background: "rgba(255,255,255,0.04)",
  borderRadius: "16px",
  border: "1px solid rgba(255,255,255,0.08)"
},

sliderGroup: {
  marginBottom: "12px",
  display: "flex",
  flexDirection: "column"
},

sliderLabel: {
  fontSize: "13px",
  fontWeight: "500",
  marginBottom: "6px",
  color: "#e5e7eb"
},

slider: {
  width: "100%",
  height: "6px",
  borderRadius: "999px",
  background: "rgba(255,255,255,0.15)",
  outline: "none",
  appearance: "none",
  WebkitAppearance: "none",
},

printButton: {
  marginTop: "10px",
  padding: "12px",
  width: "100%",
  backgroundColor: "#2563eb",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "600"
},


//navbar

page: {
  minHeight: "100vh",
  background: "linear-gradient(135deg, #0f172a, #1e293b)",
  color: "#ffffff",
  padding: "20px"
},

navbar:{
  display:"flex",
  justifyContent:"space-between",
  alignItems:"center",
  maxWidth:"1200px",
  width:"100%",
  margin:"0 auto 60px auto",
  padding:"0 20px 14px 20px",
  borderBottom:"1px solid rgba(255,255,255,0.08)"
},

navLinks:{
  display:"flex",
  alignItems:"center",
  gap:"28px",
  opacity:0.85,
  fontSize:"15px",
  cursor:"pointer"
},

logo: {
  fontSize: "22px",
  fontWeight: "700"
},



navButton: {
  padding: "10px 20px",
  borderRadius: "999px",
  border: "none",
  background: "#3b82f6",
  color: "#fff",
  fontWeight: "600",
  cursor: "pointer"
},

hero: {
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "80px",
  maxWidth: "1100px",
  margin: "0 auto",
  padding: "40px 20px"
},

heroLeft:{
  flex: 1,
  maxWidth: "520px"
},

heroRight:{
  flex:"1 1 420px",
  maxWidth:"420px",
  position:"relative"
},

heroTitle:{
  fontSize:"56px",
  fontWeight:"700",
  lineHeight:"1.1",
  maxWidth:"520px",
  marginBottom:"18px",
  background:"linear-gradient(90deg,#ffffff,#93c5fd)",
  WebkitBackgroundClip:"text",
  WebkitTextFillColor:"transparent"
},
heroSubtitle: {
  opacity: 0.8,
  marginBottom: "30px"
},

heroCTA: {
  marginTop: "20px",
  padding: "14px 28px",
  background: "linear-gradient(90deg,#3b82f6,#2563eb)",
  color: "#fff",
  border: "none",
  borderRadius: "999px",
  fontWeight: "600",
  cursor: "pointer"
},

glow: {
  position: "absolute",
  width: "500px",
  height: "500px",
  background: "radial-gradient(circle, rgba(59,130,246,0.3) 0%, transparent 70%)",
  top: "-100px",
  right: "-100px",
  zIndex: 0,
  filter: "blur(60px)",
  pointerEvents: "none",
},

emptyState: {
  textAlign: "center",
  opacity: 0.7
},

emptyIcon: {
  marginBottom: "15px",
  opacity: 0.6
},

emptyText: {
  fontSize: "16px"
},

//feature

featuresSection: {
  marginTop: "120px",
  padding: "60px 20px",
  maxWidth: "1200px",
  marginLeft: "auto",
  marginRight: "auto",
  textAlign: "center"
},

featuresTitle: {
  fontSize: "32px",
  marginBottom: "60px"
},

featuresGrid: {
  display: "flex",
  justifyContent: "space-between",
  gap: "40px",
  flexWrap: "wrap"
},

featureCard: {
  flex: "1",
  minWidth: "280px",
  background: "rgba(255,255,255,0.05)",
  padding: "30px",
  borderRadius: "16px",
  border: "1px solid rgba(255,255,255,0.1)",
  backdropFilter: "blur(10px)",
  transition: "all 0.3s ease"
},

featureIcon: {
  width: "50px",
  height: "50px",
  borderRadius: "12px",
  margin: "0 auto 20px auto",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "1px solid rgba(255,255,255,0.15)"
},

featureHeading: {
  fontSize: "18px",
  marginBottom: "10px"
},

featureText: {
  opacity: 0.7,
  fontSize: "14px",
  lineHeight: "1.6"
},

//How it wokrs 
howSection: {
  marginTop: "140px",
  padding: "80px 20px",
  maxWidth: "1200px",
  marginLeft: "auto",
  marginRight: "auto",
  textAlign: "center"
},

howTitle: {
  fontSize: "32px",
  marginBottom: "80px"
},

howGrid: {
  display: "flex",
  justifyContent: "space-between",
  gap: "40px",
  flexWrap: "wrap"
},

howCard: {
  flex: "1",
  minWidth: "280px",
  background: "rgba(255,255,255,0.05)",
  padding: "40px 30px",
  borderRadius: "16px",
  border: "1px solid rgba(255,255,255,0.1)",
  backdropFilter: "blur(10px)",
  transition: "all 0.3s ease"
},

howIcon: {
  width: "60px",
  height: "60px",
  margin: "0 auto 25px auto",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "14px",
  border: "1px solid rgba(255,255,255,0.15)"
},

//free



freeSection: {
  marginTop: "160px",
  padding: "100px 20px",
  textAlign: "center",
  maxWidth: "900px",
  marginLeft: "auto",
  marginRight: "auto"
},

freeTitle: {
  fontSize: "36px",
  marginBottom: "20px"
},

freeText: {
  opacity: 0.7,
  marginBottom: "40px",
  fontSize: "16px",
  lineHeight: "1.6"
},

freeButton: {
  padding: "14px 32px",
  borderRadius: "999px",
  border: "none",
  background: "#22c55e",
  color: "#fff",
  fontWeight: "600",
  cursor: "pointer"
},


sectionDivider: {
  width: "100%",
  height: "1px",
  margin: "80px 0",
  background:
    "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)"
},
//footer

footer: {
  marginTop: "80px",
  padding: "20px 0",
  borderTop: "1px solid rgba(255,255,255,0.08)"
},

footerContent: {
  maxWidth: "1100px",
  margin: "0 auto",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "0 20px",
  color: "rgba(255,255,255,0.6)",
  fontSize: "13px"
},

footerBrand: {
  fontWeight: "600",
  color: "#fff"
},

footerLinks: {
  display: "flex",
  gap: "25px"
},

footerCopy: {
  fontSize: "13px",
  color: "rgba(255,255,255,0.5)"
}
};

export default App;