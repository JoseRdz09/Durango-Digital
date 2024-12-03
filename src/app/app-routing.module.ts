import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { GestexcelComponent } from './components/gestexcel/gestexcel.component';
import { CardsComponent } from './components/cards/cards.component';

const routes: Routes = [
  { path: '', component: CardsComponent }, // Ruta principal muestra las tarjetas
  { path: 'gestexcel', component: GestexcelComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
