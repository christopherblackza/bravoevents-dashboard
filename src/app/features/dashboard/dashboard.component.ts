import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { DashboardService } from './services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    RouterLink
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit { 

  stats: { totalUsers: number; totalEvents: number } = { totalUsers: 0, totalEvents: 0 };

  constructor(
    private dashboardService: DashboardService
  ) {

  }

  ngOnInit() {
    this.getDashboardStats();
  }

  getDashboardStats() {
    this.dashboardService.getDashboardStats().subscribe(stats => {
      console.log(stats);

      this.stats = stats;

    });
  }
}