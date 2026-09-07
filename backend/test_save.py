import requests
import json

def test_save_catalog():
    # 1. Login
    url = 'http://127.0.0.1:8000/api/auth/login/'
    data = {
        'username': 'bhavanbadhe@gmail.com',
        'email': 'bhavanbadhe@gmail.com',
        'password': 'bhavan@123'
    }
    response = requests.post(url, json=data)
    print("Login:", response.status_code)
    
    if response.status_code == 200:
        cookies = response.cookies
        
        # 2. Create Catalog
        cat_url = 'http://127.0.0.1:8000/api/catalogs/'
        cat_data = {
            "name": "Test Catalog",
            "settings": {}
        }
        # Include CSRF token if needed, dj-rest-auth cookie login doesn't enforce it by default here but we'll see
        cat_res = requests.post(cat_url, json=cat_data, cookies=cookies)
        print("Create catalog:", cat_res.status_code, cat_res.text)
        
        if cat_res.status_code == 201:
            catalog_id = cat_res.json()['id']
            
            # 3. Save Page
            page_url = f'http://127.0.0.1:8000/api/catalogs/{catalog_id}/save_page/'
            page_data = {
                "pageNumber": 1,
                "type": "interior",
                "elements": [],
                "categoryId": None
            }
            page_res = requests.post(page_url, json=page_data, cookies=cookies)
            print("Save page:", page_res.status_code, page_res.text)

if __name__ == "__main__":
    test_save_catalog()
