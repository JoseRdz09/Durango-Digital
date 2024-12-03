import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RefrendoComponent } from '../refrendo/refrendo.component'; // Importa el componente

@Component({
  selector: 'app-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.css']
})
export class CardsComponent {
  cards = [
    {
      title: 'Ir a otra vista',
      description: 'Haz clic para ser redirigido.',
      imageUrl: '/assets/img_excel3.png'
    },
    {
      title: 'Refrendos y Replaqueos',
      description: 'Adeudo menor a un año y mayor.',
      imageUrl: '/assets/Oficio_Digital.png'
    },
  ];

  constructor(private router: Router) {}

  onCardClick(index: number): void {
    if (index === 0) {
      this.router.navigate(['/gestexcel']);
    } else if (index === 1) {
      // Abre el modal de Bootstrap
      const modalRefrendo = new (window as any).bootstrap.Modal(document.getElementById('refrendoModal'));
      modalRefrendo.show();
    }
  }
}