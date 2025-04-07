import { Observable } from 'rxjs';
import { Auth } from './../../../node_modules/@firebase/auth/dist/cordova/src/model/public_types.d';
import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})

export class AuthService {
    firebaseAuth = inject(Auth)

    register(email: string, username: string, password: string): Observable<void> {
        const promise =
    }
}