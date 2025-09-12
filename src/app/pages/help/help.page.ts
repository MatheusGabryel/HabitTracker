import { CommonModule } from '@angular/common';
import { MenuComponent } from '../../shared/components/menu/menu.component';
import { Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';
import { HeaderComponent } from "../../shared/components/header/header.component";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-help',
  templateUrl: './help.page.html',
  styleUrls: ['./help.page.scss'],
  standalone: true,
  imports: [IonContent, MenuComponent, CommonModule, HeaderComponent, FormsModule, ReactiveFormsModule],
})
export class HelpPage {
  private fb = inject(FormBuilder);

    public formulario!: FormGroup;

  public ngOnInit() {
    this.formulario = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', Validators.required],
      message: ['', [Validators.required, Validators.minLength(10)]],
      _honey: ['']
    });
  }

  public async onSubmit(event: Event) {
    event.preventDefault();

    if (this.formulario.invalid) {
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'Por favor, preencha todos os campos corretamente',
        confirmButtonColor: '#E0004D'
      });
      return;
    }

    if (this.formulario.value._honey) {
      return;
    }

    const formData = new FormData();
    formData.append('name', this.formulario.value.name);
    formData.append('email', this.formulario.value.email);
    formData.append('subject', this.formulario.value.subject);
    formData.append('message', this.formulario.value.message);
    formData.append('_captcha', 'false');

    try {
      const response = await fetch('https://formsubmit.co/mgabryel2007@gmail.com', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        Swal.fire({
          title: 'Email enviado',
          text: 'Obrigado pelo seu feedback! :)',
          heightAuto: false,
          icon: 'success',
          confirmButtonColor: '#E0004D'
        });
        this.formulario.reset();
      } else {
        throw new Error('Erro no envio do formulário');
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Erro ao enviar',
        heightAuto: false,
        text: 'Tente novamente mais tarde.',
        confirmButtonColor: '#E0004D'
      });
    }
  }
}
