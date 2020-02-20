from datetime import datetime, timedelta
from threading import Timer
import subprocess

t = None

def timer():
    global t

    if t is not None:
        t.cancel()

    now = datetime.today()

    new_hour = now.hour+1

    new_day = now.day
    if new_hour > 16:
        new_day = new_day+1
        new_hour = 7 # Start at 9 AM

    new = now.replace(day=new_day, hour=new_hour, minute=0, second=0, microsecond=0)

    delta_time = new - now
    secs = delta_time.seconds+1

    print(str(timedelta(seconds=secs)))

    t = Timer(secs, run)
    t.start()

def run():
    print("Running Command")
    subprocess.run(["python", "fetch.py"])
    timer()

if __name__ == '__main__':
    timer()
