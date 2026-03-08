const f = async () => {
    for (let i = 0; i < 8; i++) {
        try {
            const req = await fetch('https://www.aumtech.ai/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: 'username=danielle2%40university.edu&password=password123'
            });
            const t = await req.json();
            if (!t.access_token) {
                console.error('Login failed');
                return;
            }
            const c = await fetch('https://www.aumtech.ai/api/chat/query', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + t.access_token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ query: 'hello! what is my name and major?', session_id: null })
            });
            const body_text = await c.text();
            console.log("RESPONSE:", body_text);
            if (!body_text.includes("Here's what I know")) {
                console.log('✅ AI responded properly!');
                return;
            }
        } catch (e) {
            console.error(e);
        }
        console.log('Waiting 10s for Vercel rebuild...');
        await new Promise(r => setTimeout(r, 10000));
    }
    console.log('Timeout');
};
f();
