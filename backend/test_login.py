import requests

def test_login():
    url = 'http://127.0.0.1:8000/api/auth/login/'
    data = {
        'username': 'bhavanbadhe@gmail.com',
        'email': 'bhavanbadhe@gmail.com',
        'password': 'bhavan@123'
    }
    response = requests.post(url, json=data)
    print("Login status:", response.status_code)
    print("Login response:", response.json())
    print("Cookies:", response.cookies.get_dict())
    
    if response.status_code == 200:
        # Check user endpoint
        user_url = 'http://127.0.0.1:8000/api/auth/user/'
        # Use cookies
        user_res = requests.get(user_url, cookies=response.cookies)
        print("User status (with cookies):", user_res.status_code)
        print("User response (with cookies):", user_res.json())

        # Check refresh endpoint
        refresh_url = 'http://127.0.0.1:8000/api/auth/token/refresh/'
        refresh_res = requests.post(refresh_url, cookies=response.cookies)
        print("Refresh status:", refresh_res.status_code)

if __name__ == "__main__":
    test_login()
