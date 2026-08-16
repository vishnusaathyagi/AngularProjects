/* Developer note: Root app component. 
  Purpose: host the router outlet and global app shell.
  Layers: component metadata, simple title property. 
  These comments are for developer clarity and do not affect runtime. */
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'frontend';
}
