import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth';

@Component({
    selector: 'app-navigation',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './navigation.html',
    styleUrls: ['./navigation.css']
})
export class NavigationComponent implements OnInit, OnDestroy {
    isMenuOpen = false;
    isAuthenticated = false;
    currentUser: string | null = null;

    private authSubscription?: Subscription;
    private userSubscription?: Subscription;

    constructor(
        private router: Router,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        this.authSubscription = this.authService.isAuthenticated$.subscribe(
            isAuth => this.isAuthenticated = isAuth
        );

        this.userSubscription = this.authService.currentUser$.subscribe(
            user => this.currentUser = user
        );
    }

    ngOnDestroy(): void {
        if (this.authSubscription) {
            this.authSubscription.unsubscribe();
        }
        if (this.userSubscription) {
            this.userSubscription.unsubscribe();
        }
    }

    toggleMenu(): void {
        this.isMenuOpen = !this.isMenuOpen;
    }

    closeMenu(): void {
        this.isMenuOpen = false;
    }

    logout(): void {
        this.authService.logout();
        this.router.navigate(['/login']);
        this.closeMenu();
    }

    isActive(route: string): boolean {
        return this.router.url === route;
    }
}
