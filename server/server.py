from flask import Flask
from flask.json import jsonify
from flask import request, send_file
import json
import os

app = Flask("server")

def get_users():
    file = open('./users.json')
    data = json.load(file)
    file.close()

    return data

@app.route("/manifest")
def manifest():
    files = os.listdir('./data')

    files = [file for file in files if file != 'hash.db']
    
    return jsonify({'files': files})

@app.route("/get")
def get():
    file = request.args.get('file')
    user = request.args.get('key')

    data = get_users()

    if user not in data['users']:
        return jsonify({'error': 'invalid key'})

    files = os.listdir('./data')

    if file not in files:
        return jsonify({'error': 'file not found'})
    else:
        return send_file('./data/' + file, attachment_filename=file)

@app.route("/check")
def check():
    user = request.args.get('key')
    
    data = get_users()

    status = False
    if user in data['users']:	
        status = True

    return jsonify({'status': status})


@app.route("/toggle")
def enable():
    user = request.args.get('key')
    password = request.args.get('password')

    if password == 'a7saYQgW5ZF7MPyf':
        data = get_users()

        if user not in data['users']:
            data['users'].append(user)
        else:
            data['users'] = [u for u in data['users'] if u != user]

        file = open('./users.json', 'w')
        json.dump(data, file)
        file.close()

    return jsonify({'result': data})

if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0', port=80)