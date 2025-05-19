import { EmailService } from '../../services/email-service/email.service';
import { CommonModule } from '@angular/common';
import { MenuComponent } from './../../components/menu/menu.component';
import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, Injectable, OnInit } from '@angular/core';
import { IonContent, IonGrid, IonCol, IonRow } from '@ionic/angular/standalone';
import { HeaderComponent } from "../../components/header/header.component";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-help',
  templateUrl: './help.page.html',
  styleUrls: ['./help.page.scss'],
  standalone: true,
  imports: [IonRow, IonCol, IonGrid, IonContent, MenuComponent, CommonModule, HeaderComponent, FormsModule, ReactiveFormsModule],
})
export class HelpPage {

  public formulario!: FormGroup;


  constructor(private fb: FormBuilder,
    private emailService: EmailService, private http: HttpClient) { 
    }

  ngOnInit() {
    this.formulario = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', [Validators.required]],
      message: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  public onSubmit() {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      Swal.fire({
        icon: "error",
        title: "Erro",
        heightAuto: false,
        text: "Preencha os campos corretamente",
        confirmButtonColor: '#E0004D'
      });
      return
    }

    const formData = this.formulario.value;

    this.emailService.sendEmail(formData).subscribe({
      next: () => {
        Swal.fire({
          title: "Email enviado",
          text: "Obrigado pelo seu feedback! :)",
          icon: "success",
          heightAuto: false,
          confirmButtonColor: '#E0004D'
        });
        this.formulario.reset();
      },
      error: (err) => {
        console.log("Erro no envio do email:", err);
        Swal.fire({
          icon: "error",
          title: "Erro ao enviar",
          text: "Tente novamente mais tarde.",
          heightAuto: false,
          confirmButtonColor: '#E0004D'
        });
      }
    });
  }


}
