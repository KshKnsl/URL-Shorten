function myFunction() 
{
    var copyText = document.getElementById("copyme");
    if (navigator.clipboard && navigator.clipboard.writeText)
    {
        navigator.clipboard.writeText(copyText.textContent);
        return true;
    }
    else{ 
      alert("Clipboard API not supported on this device.");return false;}
}
document.querySelector('#share').addEventListener("click", async () => 
{
    navigator.vibrate(100);
    console.log("Share Button Clicked");
    var copyText = document.getElementById("copyme");
    let shareData = { title: "Shortened URL",
    text: copyText.textContent,
    url: copyText.textContent,
  };
      await navigator.share(shareData);
});

const copybtn = document.querySelector('#CopyBTN');
const successpanel = document.querySelector('#success');
copybtn.addEventListener('click', () => {
    navigator.vibrate(100);
    if(myFunction())
    {
        successpanel.style.display = 'block';
        setTimeout(() => {
            successpanel.style.display = 'none';
        }, 2000);
    }
});

document.querySelector('#qrbtn').addEventListener("click", async () => 
{
    navigator.vibrate(100);
    document.getElementById("qrimage").classList.toggle("hidden");
});

const copymeInput = document.getElementById("copyme");
const btns = document.querySelectorAll('.btns');
const textContent = copymeInput.textContent.trim();
if (textContent.length == 0) {
    copymeInput.classList.add('lg:border-none');
    btns.forEach(btn => {
    btn.disabled = true;
});
}
else{
    btns.forEach(btn => {
    btn.disabled = false;
});
}
