from sqlmodel import Session, select
from app.auth import engine, get_password_hash
from app.models import User

def seed_admins():
    with Session(engine) as session:
        # Create user 'ram'
        ram = session.exec(select(User).where(User.email == "ram")).first()
        if not ram:
            print("Creating Admin: Ram")
            ram = User(
                email="ram",
                full_name="Ram Admin",
                password_hash=get_password_hash("password"),
                is_admin=True
            )
            session.add(ram)
        else:
            print("Updating User 'ram' to Admin")
            ram.is_admin = True
            session.add(ram)

        # Create user 'shiva'
        shiva = session.exec(select(User).where(User.email == "shiva")).first()
        if not shiva:
            print("Creating Admin: Shiva")
            shiva = User(
                email="shiva",
                full_name="Shiva Admin",
                password_hash=get_password_hash("password"),
                is_admin=True
            )
            session.add(shiva)
        else:
            print("Updating User 'shiva' to Admin")
            shiva.is_admin = True
            session.add(shiva)

        session.commit()
        print("Admins seeded successfully.")

if __name__ == "__main__":
    seed_admins()
