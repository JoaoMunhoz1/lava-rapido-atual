document.addEventListener(
    "DOMContentLoaded",
    async () => {

        const SUPABASE_URL =
            "https://zmjrwoffngbilbavdzwt.supabase.co";


        const SUPABASE_PUBLISHABLE_KEY =
            "sb_publishable_YgKjSlZLARWYiTaTYLIRqg_-V3sv4Dt";


        const supabaseClient =
            supabase.createClient(
                SUPABASE_URL,
                SUPABASE_PUBLISHABLE_KEY
            );


        const loginForm =
            document.getElementById(
                "loginForm"
            );

        const forgotPasswordBtn =
            document.getElementById(
                "forgotPasswordBtn"
            );


        const emailInput =
            document.getElementById(
                "email"
            );


        const passwordInput =
            document.getElementById(
                "password"
            );


        const loginButton =
            document.getElementById(
                "loginBtn"
            );


        const loginMessage =
            document.getElementById(
                "loginMessage"
            );

           // ==================================================
// AVISO DE SESSÃO
// ==================================================

const urlParams =
    new URLSearchParams(
        window.location.search
    );

const motivo =
    urlParams.get(
        "motivo"
    );

if (
    motivo === "sessao" &&
    loginMessage
) {

    loginMessage.textContent =
        "Sua sessão expirou. Entre novamente.";
}


        // ==================================================
        // VERIFICA SE JÁ EXISTE LOGIN
        // ==================================================

        try {

            const {
                data,
                error
            } =
                await supabaseClient
                    .auth
                    .getSession();


            if (
                error
            ) {

                console.error(
                    "Erro ao verificar sessão:",
                    error
                );
            }


            if (
                data &&
                data.session &&
                motivo !== "sessao"
            ) {

    window.location.href =
        "admin.html";

    return;
}

        } catch (
            error
        ) {

            console.error(
                "Erro ao verificar login:",
                error
            );
        }

        // ==================================================
// ESQUECI MINHA SENHA
// ==================================================

if (
    forgotPasswordBtn
) {

    forgotPasswordBtn.addEventListener(
        "click",
        async () => {

            const email =
                emailInput
                    .value
                    .trim();


            loginMessage.textContent =
                "";


            if (
                !email
            ) {

                loginMessage.textContent =
                    "Digite seu e-mail primeiro.";

                return;
            }


            forgotPasswordBtn.disabled =
                true;


            forgotPasswordBtn.textContent =
                "Enviando...";


            try {

                const {
                    error
                } =
                    await supabaseClient
                        .auth
                        .resetPasswordForEmail(
                            email,
                            {
                                redirectTo:
                                    "https://lava-rapido-vt.com.br/redefinir-senha.html"
                            }
                        );


                if (
                    error
                ) {

                    console.error(
                        "Erro ao enviar recuperação:",
                        error
                    );


                    loginMessage.textContent =
                        "Não foi possível enviar o e-mail agora.";

                    return;
                }


                loginMessage.style.color =
                    "#35d07f";


                loginMessage.textContent =
                    "E-mail de recuperação enviado. Verifique sua caixa de entrada.";


            } catch (
                error
            ) {

                console.error(
                    "Erro inesperado:",
                    error
                );


                loginMessage.textContent =
                    "Não foi possível enviar o e-mail.";


            } finally {

                forgotPasswordBtn.disabled =
                    false;


                forgotPasswordBtn.textContent =
                    "Esqueci minha senha";
            }

        }
    );
}


        // ==================================================
        // LOGIN
        // ==================================================

        loginForm.addEventListener(
            "submit",
            async event => {

                event.preventDefault();


                loginMessage.textContent =
                    "";


                const email =
                    emailInput
                        .value
                        .trim();


                const password =
                    passwordInput
                        .value;


                if (
                    !email ||
                    !password
                ) {

                    loginMessage.textContent =
                        "Informe o e-mail e a senha.";

                    return;
                }


                loginButton.disabled =
                    true;


                loginButton.textContent =
                    "Entrando...";


                try {

                    const {
                        data,
                        error
                    } =
                        await supabaseClient
                            .auth
                            .signInWithPassword({
                                email:
                                    email,

                                password:
                                    password
                            });


                    if (
                        error
                    ) {

                        console.error(
                            "Erro no login:",
                            error
                        );


                        loginMessage.textContent =
                            "E-mail ou senha incorretos.";

                        return;
                    }


                    if (
                        !data ||
                        !data.session
                    ) {

                        loginMessage.textContent =
                            "Não foi possível iniciar a sessão.";

                        return;
                    }


                    console.log(
                        "✅ Login realizado."
                    );


                    window.location.href =
                        "admin.html";


                } catch (
                    error
                ) {

                    console.error(
                        "Erro inesperado:",
                        error
                    );


                    loginMessage.textContent =
                        "Não foi possível entrar. Tente novamente.";


                } finally {

                    loginButton.disabled =
                        false;


                    loginButton.textContent =
                        "Entrar";
                }

            }
        );


    }
);