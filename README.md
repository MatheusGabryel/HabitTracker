[LICENSE__BADGE]: https://img.shields.io/github/license/Fernanda-Kipper/Readme-Templates?style=for-the-badge
[TYPESCRIPT__BADGE]: https://img.shields.io/badge/typescript-D4FAFF?style=for-the-badge&logo=typescript
[ANGULAR__BADGE]: https://img.shields.io/badge/Angular-red?style=for-the-badge&logo=angular
[PROJECT__BADGE]: https://img.shields.io/badge/📱Visit_this_project-000?style=for-the-badge&logo=project
[PROJECT__URL]: https://habittracker-a4c2d.web.app
[NODE_BADGE]: https://img.shields.io/badge/node.js-22.17.1-43853D?style=for-the-badge&logo=node.js
[PRS_BADGE]: https://img.shields.io/badge/PRs-welcome-green?style=for-the-badge
[FIREBASE__BADGE]: https://img.shields.io/badge/firebase-a08021?style=for-the-badge&logo=firebase&logoColor=ffcd34
[IONIC__BADGE]: https://img.shields.io/badge/Ionic-%233880FF.svg?style=for-the-badge&logo=Ionic&logoColor=white

<h1 style="font-weight: bold;">HabitTracker 📊</h1>

`HabitTracker` is a personal habit management app designed to help users develop a healthier routine.

![license][LICENSE__BADGE]
![angular][ANGULAR__BADGE]
![typescript][TYPESCRIPT__BADGE]
![firebase][FIREBASE__BADGE]
![ionic][IONIC__BADGE]
![node][NODE_BADGE]

<details open="open">
<summary>Table of Contents</summary>
 
- [📌 Usage](#usage)
- [🛠️ Features](#features)
- [💻 Technologies](#technologies)
- [🚀 Getting started](#started)
  - [Prerequisites](#prerequisites)
  - [Cloning](#cloning)
  - [Starting](#starting)
- [🎨 Layout](#layout)
- [📍 Next Steps](#next)
- [📄 License](#license)
  
</details>

<h2 id="usage">📌 Usage</h2>

Visit the website by clicking the link below 🔽

<a href="https://habittracker-a4c2d.web.app" target="_blank">
  <img src="https://img.shields.io/badge/📱Visit_this_project-000?style=for-the-badge&logo=project"/>
</a>


<h2 id="features">🛠️ Features</h2>

- Create and track habits

- Organize habits into personalized lists

- Set goals and track progress

- Responsive interface (desktop and mobile)

<h2 id="technologies">💻 Technologies</h2>

- Angular
- Firebase (Auth, Firestore)
- Typescript
- Ionic
- RxJS

<h2 id="started">🚀 Getting started</h2>

Follow these steps to run the project locally

<h3 id="prerequisites">Prerequisites</h3>

Before you begin, make sure you meet the following requirements:

| Requirement                             | Version | Installation                                         |
| --------------------------------------- | ------- | ---------------------------------------------------- |
| [Node](https://nodejs.org)              | `>= 18` | [Donwload & Install](https://nodejs.org/en/download) |
| [Ionic CLI](https://ionicframework.com) | `>= 8`  | `npm install -g @ionic/cli@8`                        |
| [Npm](https://www.npmjs.com)            | `>= 9`  | Comes with Node                                      |

<h3 id="cloning">Cloning</h3>

Clone the repository into your machine:

```bash
git clone https://github.com/MatheusGabryel/HabitTracker.git
```

<h3 id="starting">Starting</h3>

Inside the project's root directory install the dependencies:

```bash
cd HabitTracker

npm install

ng serve
```

<h3 id="firebase">Firebase Setup</h3>

This project uses Firebase (Authentication + Firestore).  
To run it locally you need to:

1. Create a Firebase project in [Firebase Console](https://console.firebase.google.com/).  
2. Enable **Authentication (Email/Password)** and **Firestore Database**.  
3. Configure your Firestore rules to allow users access only to their own data.

<h2 id="layout">🎨 Layout</h2>

<p align="center">
    <img src="https://i.postimg.cc/CLQ0rPjV/login-habittracker.png" alt="Image Example" width="400px">
    <img src="https://i.postimg.cc/Cxng3GNn/singup-habittracker.png" alt="Image Example" width="400px">
    <img src="https://i.postimg.cc/s2pRX3bV/habit-page-habittracker.png" alt="Image Example" width="400px">
    <img src="https://i.postimg.cc/Gp0Cd477/goal-page-habittracker.png" alt="Image Example" width="400px">
</p>

<h2 id="next">📍 Next Steps</h2>

<details open="open">
<summary>Future Implementation Ideas</summary>

- Dark mode toggle
- Social features for sharing progress
- Rewards system
- Preference settings

</details>

<h2 id="license">📄 License</h2>

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
