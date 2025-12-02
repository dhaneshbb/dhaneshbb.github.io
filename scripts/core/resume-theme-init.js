// Resume viewer - theme initialization
// Copyright (c) 2025 Dhanesh B.B. All Rights Reserved.
// Theme initialization for resume viewer (defaults to dark)
// https://dhaneshbb.github.io

const savedTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);
