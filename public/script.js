function myFunction() 
{
    navigator.vibrate(200);
    var copyText = document.getElementById("copyme");
    navigator.clipboard.writeText(copyText.textContent);
}
document.querySelector('#share').addEventListener("click", async () => 
{
    navigator.vibrate(200);
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
    myFunction();
    successpanel.style.display = 'block';
    setTimeout(() => {
        successpanel.style.display = 'none';
    }, 2000);
});