const start = Date.now();
fetch('https://portfolio-in-flame-sigma.vercel.app/api/admin/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'admin', password: 'wrongpassword' })
})
.then(res => res.text().then(text => ({ status: res.status, text })))
.then(data => {
  console.log(`Took ${Date.now() - start}ms`);
  console.log(data);
})
.catch(console.error);
