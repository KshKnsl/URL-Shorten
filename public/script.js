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
    var copyText = document.getElementById("copyme");
    let shareData = { title: "Shortened URL",
    text: copyText.textContent,
    url: copyText.textContent,
  };
      await navigator.share(shareData);
});

const copybtn = document.querySelector('#CopyBTN');
const successpanel = document.querySelector('#success');
const copymeInput = document.getElementById("copyme");

copymeInput.addEventListener('click', () => {
    navigator.vibrate(100);
    if(myFunction())
    {
        successpanel.style.display = 'block';
        setTimeout(() => {
            successpanel.style.display = 'none';
        }, 2000);
    }
});
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
document.querySelector('#customqr').addEventListener("click", async () => 
{
    navigator.vibrate(100);
    document.getElementById("customqrform").classList.toggle("hidden");
});

const btns = document.querySelectorAll('.btns');
const textContent = copymeInput.textContent.trim();
if (textContent.length == 0) {
    copymeInput.classList.add('lg:border-none');
    btns.forEach(btn => {
    btn.disabled = true;
});
}
else{
    copymeInput.classList.remove('lg:border-none');
    btns.forEach(btn => {
    btn.disabled = false;
});
}

async function fetchCustomURL() 
{
    let link = document.getElementById('input').value;
    let urlc = document.getElementById('urlinput').value;
    try {
        console.log('Fetching custom URL...');
        const response = await fetch('/curtomurl', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ link: link, url: urlc}),
        });
        let avaliable = await response.text();
        console.log(avaliable);
        if(avaliable != 'false')
        {
            document.getElementById('avaliable').style.display = 'flex';
            document.getElementById('notavaliable').style.display = 'none';
            window.location.href = avaliable;
        }
        else
        {
            document.getElementById('avaliable').style.display = 'none';
            document.getElementById('notavaliable').style.display = 'flex';
        }
    } catch (error) {
        console.error('Error fetching custom URL:', error);
    }
}
