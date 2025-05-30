import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

export class SwalUtil {

    /**
   * Show a SweetAlert with optional routing
   * @param title - The title of the alert
   * @param text - The text/body of the alert
   * @param icon - The icon type ('success', 'error', 'warning', 'info', 'question')
   * @param router - The Angular Router instance (optional)
   * @param route - The route to navigate to after the alert (optional)
   */



  static showAlert(
    //icon: 'success' | 'error' | 'warning' | 'info' | 'question',
    icon: string,
    title: string,
    text: string,
    router?: Router,
    route?: string
  ): void {
    Swal.fire({
      icon:icon as any,
      title,
      text,
      width: '400px',
      heightAuto: false,
      confirmButtonColor: '#005F83'
    }).then((result) => {
      if (result.isConfirmed && router && route) {
        router.navigate([route]); // Navigate to the specified route
      }
    });
  }
}
