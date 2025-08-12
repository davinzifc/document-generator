import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Tributario } from './components/template/tributario/tributario';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Tributario],
  standalone: true,
  providers: [Tributario],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('document');
}
