const start = Date.now();
fetch('http://localhost:5000/api/admin/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'admin ', password: 'admin1234' })
})
.then(res => res.text().then(text => ({ status: res.status, text })))
.then(data => {
  console.log(`Took ${Date.now() - start}ms`);
  console.log(data);
})
.catch(console.error);
