import { UserService } from 'src/app/services/user/user.service';
import { CommonModule } from '@angular/common';
import { MenuComponent } from '../../shared/components/menu/menu.component';

import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { menuOutline, } from 'ionicons/icons';
import { MenuService } from 'src/app/services/menu/menu.service';
import { HeaderComponent } from "../../shared/components/header/header.component";
import { ToggleThemeComponent } from "../../shared/ui/toggle-theme/toggle-theme.component";
import { SwitchComponent } from "../../shared/ui/switch/switch.component";
import { animate, state, style, transition, trigger } from '@angular/animations';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { UserData } from 'src/app/interfaces/user.interface';
import { Loading } from 'notiflix';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [IonContent, MenuComponent, CommonModule, HeaderComponent, ToggleThemeComponent, SwitchComponent, FormsModule],
})
export class SettingsPage {
  public currentSection: string = 'account';
  public userName: string = '';
  public userEmail: string = '';
  public isDisabled: boolean = true;
  public buttonText: string = 'Editar';
  public editName: string = '';

  constructor(public menuService: MenuService, private userService: UserService) {
    addIcons({ menuOutline });
  }

  ngOnInit() {
    this.userService.getUserId().then((uid) => {
      if (uid) {
        this.userService.getUserDoc(uid).then(data => {
          if (data) {
            this.userName = data.displayName;
            this.userEmail = data.email;
            this.editName = this.userName;
          }
        });
      }
    });
  }

  changeSection(section: string) {
    this.currentSection = section
  }

  toggleEdit() {
    if (this.buttonText === 'Editar') {
      this.isDisabled = false;
      this.buttonText = 'Cancelar';
    } else if (this.buttonText === 'Cancelar') {
      this.editName = this.userName;
      this.isDisabled = true;
      this.buttonText = 'Editar';
    } else if (this.buttonText === 'Salvar') {
      this.changeName()

    }
  }

  checkChanges() {
    if (this.editName !== this.userName) {
      this.buttonText = 'Salvar';
    } else if (!this.isDisabled) {
      this.buttonText = 'Cancelar';
    }
  }

  changeName() {
    try {
      Swal.fire({
        title: "Confirmação", text: "Deseja alterar o nome?", icon: "warning", heightAuto: false, showCancelButton: true, confirmButtonColor: "#1976d2", cancelButtonColor: "#d33", cancelButtonText: 'Cancelar.', confirmButtonText: "Sim, desejo alterar."
      }).then((result) => {
        if (result.isConfirmed) {
          const editData: Partial<UserData> = {
            displayName: this.editName,
            avatar: `https://avatar.iran.liara.run/username?username=${this.editName.split(/\s+/).join('+')}`
          }
          this.userName = this.editName
          this.userService.updateUserData(editData)
          this.isDisabled = true;
          this.buttonText = 'Editar';
          Swal.fire({
            title: 'Sucesso', text: 'Nome alterado com sucesso', icon: 'success', heightAuto: false, confirmButtonColor: '#E0004D'
          });
        }
      })
    } catch (err: unknown) {
      if (err instanceof Error) {
        Swal.fire({ title: 'Erro', text: 'Não foi possivel altera o nome', icon: 'error', heightAuto: false, confirmButtonColor: '#E0004D' });
      } else {
        Swal.fire({ title: 'Erro', text: 'Ocorreu um erro desconhecido', icon: 'error', heightAuto: false, confirmButtonColor: '#E0004D' });
      }
    }
  }

  deleteUser() {
    try {
      Swal.fire({
        title: "Atenção!", html: `
    <p>Esta ação irá <strong>apagar todos os seus dados permanentemente</strong>, incluindo hábitos, metas, listas e <strong>sua conta</strong>.</p>
  `, icon: "warning", heightAuto: false, showCancelButton: true, confirmButtonColor: "#1976d2", cancelButtonColor: "#d33", cancelButtonText: 'Cancelar.', confirmButtonText: "Sim, desejo alterar."
      }).then((result) => {
        if (result.isConfirmed) {
          Loading.standard('Apagando conta...');
          this.userService.deleteUser()
          Loading.remove()
          Swal.fire({
            title: 'Conta apagada 😔', html: `<p>Sentiremos sua falta! Sua conta e todos os seus dados foram permanentemente apagados.</p>`, icon: 'success', confirmButtonColor: '#1976d2', heightAuto: false
          });

        }
      })
    } catch (err: unknown) {
      if (err instanceof Error) {
        Swal.fire({ title: 'Erro', text: 'Não foi possivel altera o nome', icon: 'error', heightAuto: false, confirmButtonColor: '#E0004D' });
      } else {
        Swal.fire({ title: 'Erro', text: 'Ocorreu um erro desconhecido', icon: 'error', heightAuto: false, confirmButtonColor: '#E0004D' });
      }
    } finally {
      Loading.remove()
    }
  }
}
