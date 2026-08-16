package com.Subodh26oct.projects.lovable_clone.annotation;

import com.Subodh26oct.projects.lovable_clone.enums.QuotaType;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RequireQuota {
    QuotaType value() default QuotaType.AI_TOKENS;
}
