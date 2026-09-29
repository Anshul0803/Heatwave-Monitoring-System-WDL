
$(function(){
  // Shared navigation / mobile menu
  $("#menuBtn").on("click", function(){ $(".navlinks").toggleClass("open"); });
  const current = location.pathname.split("/").pop() || "index.html";
  $(".navlinks a").each(function(){ if($(this).attr("href") === current) $(this).addClass("active"); });

  // live clock
  function tick(){
    const d = new Date();
    $("#liveClock").text(d.toLocaleTimeString([], {hour:"2-digit",minute:"2-digit",second:"2-digit"}));
  }
  tick(); setInterval(tick,1000);

  // dashboard temperature bars
  const temps=[34,36,38,39,41,40,37,35,39,42];
  if($("#tempBars").length){
    temps.forEach(v => $("#tempBars").append(`<div class="bar" style="height:${Math.max(16,(v-30)*17)}px"><span>${v}°</span></div>`));
  }

  // Generic toast
  window.toast = function(msg){
    $("#toast").text(msg).addClass("show");
    setTimeout(()=>$("#toast").removeClass("show"),2400);
  };

  // Risk calculator (Task 2)
  $("#riskForm").on("submit", function(e){
    e.preventDefault();
    const t=Number($("#riskTemp").val()), h=Number($("#riskHumidity").val()), f=Number($("#riskForecast").val());
    let level="NORMAL", rec="Continue monitoring conditions.", cls="normal";
    if(t>=40){level="SEVERE";rec="Issue Severe Heatwave Warning.";cls="high";}
    else if(t>=38 && h>=60){level="HIGH";rec="Issue Heatwave Warning.";cls="high";}
    else if(t>=35 && t<=38){level="MODERATE";rec="Monitor conditions closely.";cls="watch";}
    else if(f>=40){level="EARLY WARNING";rec="Prepare for possible heatwave conditions.";cls="watch";}
    $("#riskResult").html(`<span class="tag ${cls}">${level}</span><h3 style="margin:12px 0 4px">${rec}</h3><p>Temperature: ${t}°C · Humidity: ${h}% · Forecast: ${f}°C</p>`);
  });

  // Temperature analysis (Task 1 + Task 4)
  $("#analysisForm").on("submit", function(e){
    e.preventDefault();
    const loc=$("#analysisLocation").val().trim() || "Mumbai";
    const t=Number($("#analysisTemp").val()), threshold=Number($("#analysisThreshold").val()), hum=Number($("#analysisHumidity").val());
    const diff=t-threshold;
    const detected=t>=threshold;
    $("#analysisResult").html(`<div class="${detected?"callout":"success"}"><strong>${loc}</strong><br>Current Temperature: ${t}°C<br>Heatwave Threshold: ${threshold}°C<br>Temperature Difference: ${diff>=0?"+":""}${diff}°C<br><b>Status: ${detected?"Heatwave Condition Detected":"Below Heatwave Threshold"}</b><br>Humidity: ${hum}%</div>`);
    console.log({loc,t,threshold,hum,diff,detected});
  });

  // Climate object (Task 3)
  $("#objectForm").on("submit", function(e){
    e.preventDefault();
    const data={
      location:$("#objLocation").val().trim(), city:$("#objCity").val().trim(),
      temperature:Number($("#objTemp").val()), humidity:Number($("#objHumidity").val()),
      windSpeed:Number($("#objWind").val()), forecastTemperature:Number($("#objForecast").val()),
      riskLevel:"", alertStatus:$("#objAlert").val(), monitoringDate:$("#objDate").val(),
      temperatureDifference:function(){return this.temperature-37;},
      determineRisk:function(){
        if(this.temperature>=40)return "Severe";
        if(this.temperature>=38 && this.humidity>=60)return "High";
        if(this.temperature>=35)return "Moderate";
        return "Normal";
      },
      displayData:function(){return `${this.city} · ${this.temperature}°C · ${this.humidity}% humidity · ${this.windSpeed} km/h wind`;}
    };
    data.riskLevel=data.determineRisk();
    $("#objectResult").html(`<div class="grid-3">
      <div><span class="metric-label">Location</span><div class="metric" style="font-size:22px">${data.location}</div></div>
      <div><span class="metric-label">Risk</span><div class="metric"><span class="tag ${data.riskLevel==="Severe"||data.riskLevel==="High"?"high":data.riskLevel==="Moderate"?"watch":"normal"}">${data.riskLevel}</span></div></div>
      <div><span class="metric-label">Alert</span><div class="metric" style="font-size:22px">${data.alertStatus}</div></div>
    </div><p>${data.displayData()} · Forecast ${data.forecastTemperature}°C · Δ threshold ${data.temperatureDifference()}°C · ${data.monitoringDate}</p>`);
    console.log(data);
  });

  // Registration validation (Tasks 5/6 + Expt 4)
  function err(id,msg){ $("#"+id).text(msg); $("#"+id.replace("Error","")).addClass("invalid"); }
  function clearField(id){ $("#"+id+"Error").text(""); $("#"+id).removeClass("invalid"); }
  $("#registrationForm").on("submit", function(e){
    e.preventDefault();
    const fields=["regName","regMobile","regEmail","regLocation","regUserId","regPin","regCategory","regChannel","regDate"];
    fields.forEach(clearField);
    let ok=true;
    const name=$("#regName").val().trim(), mobile=$("#regMobile").val().trim(), email=$("#regEmail").val().trim();
    const loc=$("#regLocation").val().trim(), uid=$("#regUserId").val().trim(), pin=$("#regPin").val().trim();
    if(!/^[A-Za-z ]+$/.test(name)){err("regNameError","Use alphabets and spaces only.");ok=false}
    if(!/^[6-9][0-9]{9}$/.test(mobile)){err("regMobileError","Enter a valid 10-digit Indian mobile number.");ok=false}
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){err("regEmailError","Enter a valid email address.");ok=false}
    if(!/^[A-Za-z ]+$/.test(loc)){err("regLocationError","Location should contain alphabets and spaces.");ok=false}
    if(!/^CLM-[0-9]{4}$/.test(uid)){err("regUserIdError","Use format CLM-1234.");ok=false}
    if(!/^[0-9]{6}$/.test(pin)){err("regPinError","PIN must contain exactly 6 digits.");ok=false}
    if(!$("#regCategory").val()){err("regCategoryError","Select a user category.");ok=false}
    if(!$("#regChannel").val()){err("regChannelError","Select an alert channel.");ok=false}
    const date=$("#regDate").val(), today=new Date().toISOString().slice(0,10);
    if(!date){err("regDateError","Registration date is required.");ok=false}
    else if(date>today){err("regDateError","Registration date cannot be in the future.");ok=false}
    if(ok){$("#regSuccess").html("<b>Registration Successful!</b><br>You are registered for Climate Intelligence Heatwave Monitoring and Early-Warning Alerts.").show();toast("Registration completed");}
    else $("#regSuccess").hide();
  });

  // Experiment 4 standalone monitoring form
  $("#monitorForm").on("submit", function(e){
    e.preventDefault();
    let ok=true;
    $(".monitor-error").text("");
    const name=$("#mName").val().trim(), station=$("#mStation").val().trim(), email=$("#mEmail").val().trim(), mobile=$("#mMobile").val().trim();
    if(!/^[A-Za-z ]{3,}$/.test(name)){$("#mNameError").text("Invalid observer name.");ok=false}
    if(!/^AWS[0-9]{3}$/.test(station)){$("#mStationError").text("Use station format AWS001.");ok=false}
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){$("#mEmailError").text("Invalid email.");ok=false}
    if(!/^[6-9][0-9]{9}$/.test(mobile)){$("#mMobileError").text("Enter a valid 10-digit mobile number.");ok=false}
    const temp=Number($("#mTemp").val()), hum=Number($("#mHumidity").val()), date=$("#mDate").val();
    if(!Number.isFinite(temp)){$("#mTempError").text("Temperature must be numeric.");ok=false}
    if(!Number.isFinite(hum)||hum<0||hum>100){$("#mHumidityError").text("Humidity must be between 0 and 100%.");ok=false}
    if(!date){$("#mDateError").text("Observation date is required.");ok=false}
    if(ok){$("#monitorSuccess").html("<b>Observation accepted.</b> All monitoring and contact fields passed validation.").show();toast("Monitoring record valid");}
    else $("#monitorSuccess").hide();
  });

  // Subscription
  $("#subscribeForm").on("submit", function(e){
    e.preventDefault();
    const name=$("#subName").val().trim(), email=$("#subEmail").val().trim();
    if(!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){toast("Please enter a valid name and email");return}
    $("#subSuccess").show();toast("Advisory subscription saved");
  });

  // Hotspot map pins
  $(".pin").on("click",function(){toast($(this).data("label")+" selected");});

  // Gallery / media controls
  $("#playAwareness").on("click",function(){toast("Awareness preview started");$("#awarenessBox").addClass("glow");});
});
