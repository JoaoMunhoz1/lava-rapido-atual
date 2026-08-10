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


        const resetForm =
            document.getElementById(
                "resetForm"
            );

        const newPasswordInput =
            document.getElementById(
                "newPassword"
            );

        const confirmPasswordInput =
            document.getElementById(
                "confirmPassword"
            );

        const resetMessage =
            document.getElementById(
                "resetMessage"
            );

        const resetBtn =
            document.getElementById(
                "resetBtn"
            );


        // =========================================
        // VERIFICA SE O LINK DE RECUPERAÇÃO É VÁLIDO
        // =========================================

        const {
            data: sessionData
        } =
            await supabaseClient
                .auth
                .getSession();


        if (
            !sessionData ||
            !sessionData.session
        ) {

            resetMessage.textContent =
                "Link de recuperação inválido ou expirado.";

            resetBtn.disabled =
                true;

            return;
        }


        // =========================================
        // ALTERAR SENHA
        // =========================================

        resetForm.addEventListener(
            "submit",
            async event => {

                event.preventDefault();


                resetMessage.textContent =
                    "";


                const newPassword =
                    newPasswordInput.value;

                const confirmPassword =
                    confirmPasswordInput.value;


                if (
                    newPassword.length < 8
                ) {

                    resetMessage.textContent =
                        "A senha deve ter pelo menos 8 caracteres.";

                    return;
                }


                if (
                    newPassword !==
                    confirmPassword
                ) {

                    resetMessage.textContent =
                        "As senhas não coincidem.";

                    return;
                }


                resetBtn.disabled =
                    true;

                resetBtn.textContent =
                    "Alterando...";


                try {

                    const {
                        error
                    } =
                        await supabaseClient
                            .auth
                            .updateUser({
                                password:
                                    newPassword
                            });


                    if (
                        error
                    ) {

                        console.error(
                            "Erro ao alterar senha:",
                            error
                        );

                        resetMessage.textContent =
                            "Não foi possível alterar a senha.";

                        return;
                    }


                    resetMessage.style.color =
                        "#35d07f";

                    resetMessage.textContent =
                        "Senha alterada com sucesso!";


                    setTimeout(
                        () => {

                            window.location.href =
                                "login.html";

                        },
                        1500
                    );


                } catch (
                    error
                ) {

                    console.error(
                        "Erro inesperado:",
                        error
                    );

                    resetMessage.textContent =
                        "Ocorreu um erro. Tente novamente.";


                } finally {

                    resetBtn.disabled =
                        false;

                    resetBtn.textContent =
                        "Alterar senha";
                }

            }
        );

    }
);