const fs = require('fs');

const key = "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDU/vucG4ROKz4S\naO3dpFC5q16lr3852M4thBO83e5+hy7YuVNfDUoWNiPbsEgKtfMwjk5S4Rd5KDeM\nTwyJ7AyL4XSH7Nam/hCxg48RRrbx8w83y83pZ8WzMJ+W+ldSK/c9ysNR/G/U+xiJ\nOhhN4wqkq27Hd7UOZ0XR3epBKOeKTh86iJ/LCbDhT8aB6NMTqHiqUCdJk/09IqFG\nx+TsswdLoPqPpAkVr1WoLsvDuE4lLo1G0Yn+3KfBfF+K5FUJiY0XMVCYbSFS30fx\nv1I0gWQv4CU4WKINrffkIu7SGE/8w51qO3ePT8ciecseOnKM7e98MKZHbDJddydy\nqQO6fh2XAgMBAAECggEAG/b4WPgh6FN0HF2rcVC8CoyN6in/BbzJ4R74qnDm+bTM\n+UZnxFCN3BmynoroAoP+EG92qBoGh3E4zdKpHkigIxNwRdJaImW0EmJn+8gxh9W2\nN0iqWc02nz6wjVWD9nVwSiwfddmzYx6ui4HVpBA9mv4pFsZIPsJfX90HfxOcRsOa\ns2xZuve0FJiO4NznZ+ETtrrdnpEqLf5FeOVvaiZjJkFtetCJbgrHj+r40Dl0O9If\nGtxIXdHzk9OyJ3/7wgaGvc7eH7J7lOS2mvdjlqXTQRsxpgf0zI37N8NYj4ManLi+\nK36anbG9RjMZSs5S7KlmE3ZOZJBRIbT2bj3aKOPnjQKBgQDrQnVVUuSuw842Y/wZ\n+95Khe+WI8p3pHvC3n8Q8aZOAEl68aZl0ABu3mnULZOMklBLVjLr1eMWEWw+tTrz\nVy7esDfBV89RCc7OtTzq7Nbki/noUxlThCk6U+MKsKcJb62tpUdRwgngLlzNgyMO\ncSL6G6047J/acLGlei9BMFiTTQKBgQDnxg+Y2yVZVr6dVD5D0UdBHVp46q04ceqV\nxy5LhWqr22m26y533KNTLujuJjlUsD6xTjFNfBtmZ8XPAtnD7+cDTdxj0Ag+Hj4c\n7QM2aVFlB3r9Wop63f2Zb/tVS83jtKj1bhW/xhefwleWUzUXaJ4OTF/3nZHvSW5Q\n1E3GU2a6cwKBgQCLnXQef8QhByjg1HNvRC8GkPe/ZVwppp6f5gUInDAyyC7TXIeA\nknE/WpT5i1auLMYNkklD9jn/BbX0fP8QHKQ/GdrszdzF3gkyWRJe5NEe7wcPXgmA\nq8T/zXrHBFEM447xp01s8reDqGAAwptSXcgBH92sE5lGPGzgpGNYz4UxXQKBgQDB\nxg10NoPbVXK4Bp6oBGgWQHxLa6i28Ea4QnaqHTk5xY90ptuKyqSh/y4vLTXxYAiK\nJF2D8qbVzxzKHhACiKgTUx1XNa4ugQpdFKsC6rpqRP7GotP0NXS4u67deSsBnSFF\nUGxOkUdfAhRIUfipQYYjXic91jcUX8gjO9xqW4AfkQKBgQCI9RqpO7Bu2hXKqGiX\nSF8ztyYW7A64gVl1cew5kFY/U76fwA1BqQC0hWmm00ebS9ebxFFNF3fVK0MUjnBw\n2qD/hEq0mEReEylJ0qXQgngUI+liBKO1LtapszHtBJSPYzML7DvQk/AlKlb0qCUd\nnHk+xTL6NkodRRAc/UwEW6KMvg==\n-----END PRIVATE KEY-----\n";

const creds = {
    "type": "service_account",
    "project_id": "gulf-career-gateway-v2",
    "private_key_id": "a1948e6e12eeed8c32effb8206f421df2ce8e6e2",
    "private_key": key,
    "client_email": "whatsapp-bot@gulf-career-gateway-v2.iam.gserviceaccount.com",
    "client_id": "111596834859596827465",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/whatsapp-bot%40gulf-career-gateway-v2.iam.gserviceaccount.com",
    "universe_domain": "googleapis.com"
};

fs.writeFileSync('google-credentials.json', JSON.stringify(creds, null, 2));
console.log('Credentials file created');
