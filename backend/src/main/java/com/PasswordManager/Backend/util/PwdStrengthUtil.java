package com.PasswordManager.Backend.util;

import com.nulabinc.zxcvbn.Zxcvbn;
import com.nulabinc.zxcvbn.Strength;
import com.nulabinc.zxcvbn.AttackTimes.CrackTimesDisplay;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

public final class PwdStrengthUtil {

    private static final Zxcvbn ZX = new Zxcvbn();
    private static final Pattern LOWER = Pattern.compile("[a-z]");
    private static final Pattern UPPER = Pattern.compile("[A-Z]");
    private static final Pattern DIGIT = Pattern.compile("\\d");
    private static final Pattern SYMBOL = Pattern.compile("[^A-Za-z0-9]");

    public static List<String> analyze(String password) {
        Strength s = ZX.measure(password);
        List<String> out = new ArrayList<>();

        out.add("score:" + s.getScore());

        CrackTimesDisplay ct = s.getCrackTimesDisplay();
        out.add("crackTime:" + ct.getOfflineFastHashing1e10PerSecond());

        int len = password.length();
        boolean hasLower = LOWER.matcher(password).find();
        boolean hasUpper = UPPER.matcher(password).find();
        boolean hasDigit = DIGIT.matcher(password).find();
        boolean hasSymbol = SYMBOL.matcher(password).find();
        boolean allLetters = password.matches("[A-Za-z]+");

        if (len < 12) {
            out.add("Make it at least 12–16 characters long.");
        } else if (len < 16) {
            out.add("Longer passwords are significantly stronger. Aim for 16+ characters.");
        }

        if (!hasLower)
            out.add("Add lowercase letters.");
        if (!hasUpper)
            out.add("Include uppercase letters.");
        if (!hasDigit)
            out.add("Add digits to increase complexity.");
        if (!hasSymbol)
            out.add("Include symbols like !, @, # for more entropy.");

        if (allLetters)
            out.add("Mix letters with numbers and symbols to boost entropy.");

        return out.stream().distinct().toList();
    }

    private PwdStrengthUtil() {
    }
}
